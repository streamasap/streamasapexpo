import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  joinDate?: string; 
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFirstTimeUser: boolean;
  hasCompletedAuthOnboarding: boolean;
  signIn: (userData: User, token?: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeFirstTimeWalkthrough: () => Promise<void>;
  completeAuthOnboarding: () => Promise<void>;
  getInitialRoute: () => '/(tabs)' | '/(personalized)' | '/(auth)/login' | '/(onboard)/slides';
  updateUserProfile: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = '@auth_user';
const TOKEN_KEY = '@user_token';
const FIRST_TIME_KEY = '@is_first_time_app';
const AUTH_ONBOARDING_KEY = '@has_completed_auth_onboarding';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);
  const [hasCompletedAuthOnboarding, setHasCompletedAuthOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        const storedFirstTime = await AsyncStorage.getItem(FIRST_TIME_KEY);
        const storedAuthOnboarding = await AsyncStorage.getItem(AUTH_ONBOARDING_KEY);

        if (isMounted) {
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }

          if (storedFirstTime === 'false') {
            setIsFirstTimeUser(false);
          } else {
            setIsFirstTimeUser(true);
          }

          if (storedAuthOnboarding === 'true') {
            setHasCompletedAuthOnboarding(true);
          }
        }
      } catch (error) {
        console.error('Error loading auth storage:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkStorage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Called ONLY after completing initial onboarding slides (NOT on Get Started click)
  const completeFirstTimeWalkthrough = async () => {
    setIsFirstTimeUser(false);
    await AsyncStorage.setItem(FIRST_TIME_KEY, 'false');
  };

  // Called when user completes Who's Watching / Profile & Genre selection
  const completeAuthOnboarding = async () => {
    setHasCompletedAuthOnboarding(true);
    await AsyncStorage.setItem(AUTH_ONBOARDING_KEY, 'true');
  };

  const updateUserProfile = async (updatedUser: Partial<User>) => {
    setUser((prevUser) => {
      const mergedUser = prevUser ? { ...prevUser, ...updatedUser } : (updatedUser as User);
      AsyncStorage.setItem(USER_KEY, JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  // Called upon successful OTP verification
  const signIn = async (userData: User, tokenStr?: string) => {
    setUser(userData);
    setIsFirstTimeUser(false);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    await AsyncStorage.setItem(FIRST_TIME_KEY, 'false');
    if (tokenStr) {
      await AsyncStorage.setItem(TOKEN_KEY, tokenStr);
    }
  };

  // Sign out & reset storage
  const signOut = async () => {
    setIsLoading(true);
    try {
      // await AsyncStorage.clear();
      // setUser(null);
      // setIsFirstTimeUser(true);
      // setHasCompletedAuthOnboarding(false);
      await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY]);
      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialRoute = (): '/(tabs)' | '/(personalized)' | '/(auth)/login' | '/(onboard)/slides' => {
    if (user) {
      if (!hasCompletedAuthOnboarding) {
        return '/(personalized)';
      }
      return '/(tabs)';
    }

    if (isFirstTimeUser) {
      return '/(onboard)/slides';
    }

    return '/(auth)/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFirstTimeUser,
        hasCompletedAuthOnboarding,
        updateUserProfile,
        signIn,
        signOut,
        completeFirstTimeWalkthrough,
        completeAuthOnboarding,
        getInitialRoute,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
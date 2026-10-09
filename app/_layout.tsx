import { Stack, DarkTheme, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading, isFirstTimeUser, hasCompletedAuthOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Wait until auth state is loaded and navigation context is mounted
    if (isLoading || !isNavigationReady) return;

    const topSegment = (segments[0] || 'index') as string;

    const isProtectedGroup = topSegment === '(tabs)';
    const isPostLoginOnboarding = topSegment === '(subscription)' || topSegment === '(personalized)';
    const isWalkthroughGroup = topSegment === '(onboard)';
    const isAuthGroup = topSegment === '(auth)';
    const isIndexRoute = topSegment === 'index';

    // Allow splash screen at '/' to handle its own timer & navigation
    if (isIndexRoute) return;

    if (!user) {
      if (isProtectedGroup || isPostLoginOnboarding) {
        router.replace('/(auth)/login' as any);
      } else if (!isFirstTimeUser && isWalkthroughGroup) {
        router.replace('/(auth)/login' as any);
      } else if (isFirstTimeUser && isAuthGroup) {
        router.replace('/(onboard)/slides' as any);
      }
    } else {
      if (!hasCompletedAuthOnboarding) {
        if (isAuthGroup || isWalkthroughGroup || isProtectedGroup) {
          router.replace('/(subscription)' as any);
        }
      } else {
        if (isAuthGroup || isWalkthroughGroup || isPostLoginOnboarding) {
          router.replace('/(tabs)' as any);
        }
      }
    }
  }, [user, isLoading, isFirstTimeUser, hasCompletedAuthOnboarding, segments, isNavigationReady]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' },
        animation: 'fade',
      }}>
      <Stack.Screen 
        name="index" 
        listeners={{
          focus: () => setIsNavigationReady(true),
        }} 
      />
      <Stack.Screen name="(onboard)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(subscription)" />
      <Stack.Screen name="(personalized)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={DarkTheme}>
          <RootLayoutNav />
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../context/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Profile {
  id: string;
  name: string;
  isKids: boolean;
  avatarUri?: string;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop';

export default function WhosWatchingScreen() {
  const router = useRouter();
  const { user, completeAuthOnboarding, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Filter out default generated "User_XXXX" string so input field stays clean and empty
  const initialName = user?.name && !user.name.startsWith('User_') ? user.name : '';

  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: 'main_user',
      name: initialName,
      isKids: false,
      avatarUri: DEFAULT_AVATAR,
    },
    {
      id: 'kids_user',
      name: 'Kids',
      isKids: true,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string>('main_user');
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current['main_user'] && !initialName) {
        inputRefs.current['main_user']?.focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleNameChange = (id: string, text: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: text } : p))
    );
  };

  const handleAddProfile = () => {
    const emptyProfile = profiles.find((p) => !p.isKids && !p.name.trim());

    if (emptyProfile) {
      setSelectedId(emptyProfile.id);
      inputRefs.current[emptyProfile.id]?.focus();
      return;
    }

    const newId = `user_${Date.now()}`;
    const newProfile: Profile = {
      id: newId,
      name: '',
      isKids: false,
      avatarUri: DEFAULT_AVATAR,
    };

    setProfiles((prev) => [...prev, newProfile]);
    setSelectedId(newId);

    setTimeout(() => {
      if (inputRefs.current[newId]) {
        inputRefs.current[newId]?.focus();
      }
    }, 100);
  };

  const handleProfilePress = async (profile: Profile) => {
    if (selectedId !== profile.id) {
      setSelectedId(profile.id);
      if (!profile.isKids && !profile.name.trim()) {
        inputRefs.current[profile.id]?.focus();
      }
      return;
    }

    if (!profile.isKids && !profile.name.trim()) {
      inputRefs.current[profile.id]?.focus();
      return;
    }

    setLoading(true);

    try {
      const isKids = profile.isKids;
      const finalName = isKids ? 'Kids' : profile.name.trim();

      if (user?.phone) {
        const token = await AsyncStorage.getItem('@user_token');
        const response = await fetch(`${API_BASE_URL}/auth/profile1`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            phone: user.phone,
            name: finalName,
          }),
        });

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (response.ok && data.success && data.user) {
            await updateUserProfile(data.user);
          }
        } else {
          const rawText = await response.text();
          console.error('Non-JSON response received:', response.status, rawText);
        }
      }

      await completeAuthOnboarding();
      router.replace('/(tabs)' as any);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.title}>Who's Watching?</Text>
          <Text style={styles.subtitle}>Choose a profile to start streaming.</Text>
        </View>

        <View style={styles.profilesWrapper}>
          <View style={styles.row}>
            {profiles.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <View key={item.id} style={styles.profileItem}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={loading}
                    onPress={() => handleProfilePress(item)}>
                    <LinearGradient
                      colors={
                        isSelected
                          ? ['#10B981', '#06B6D4']
                          : ['#8B5CF6', '#3B82F6', '#06B6D4']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.gradientBorder,
                        isSelected && styles.activeGlow,
                      ]}>
                      {item.isKids ? (
                        <View style={styles.kidsBadgeContainer}>
                          <Text style={styles.kidsText}>
                            <Text style={{ color: '#F59E0B' }}>K</Text>
                            <Text style={{ color: '#06B6D4' }}>i</Text>
                            <Text style={{ color: '#3B82F6' }}>d</Text>
                            <Text style={{ color: '#10B981' }}>s</Text>
                          </Text>
                        </View>
                      ) : (
                        <Image
                          source={{ uri: item.avatarUri || DEFAULT_AVATAR }}
                          style={styles.avatarImage}
                        />
                      )}

                      {isSelected && (
                        <View style={styles.activeCheckBadge}>
                          {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Ionicons name="checkmark-sharp" size={12} color="#FFFFFF" />
                          )}
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {item.isKids ? (
                    <Text style={styles.profileName}>Kids</Text>
                  ) : (
                    <TextInput
                      ref={(ref) => {
                        inputRefs.current[item.id] = ref;
                      }}
                      style={[
                        styles.nameInput,
                        isSelected && styles.activeNameInput,
                      ]}
                      value={item.name}
                      onChangeText={(text) => handleNameChange(item.id, text)}
                      placeholder=""
                      selectionColor="#38BDF8"
                      onFocus={() => setSelectedId(item.id)}
                      autoCorrect={false}
                      editable={!loading}
                    />
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.centerAddRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading}
              style={styles.profileItem}
              onPress={handleAddProfile}>
              <View style={styles.addIconCircle}>
                <Ionicons name="add" size={44} color="#FFFFFF" />
              </View>
              <Text style={styles.profileName}>Add profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  profilesWrapper: { alignItems: 'center', gap: 36 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 32 },
  centerAddRow: { alignItems: 'center' },
  profileItem: { alignItems: 'center', width: 110 },
  gradientBorder: { width: 104, height: 104, borderRadius: 52, padding: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 10, position: 'relative' },
  activeGlow: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 8 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
  kidsBadgeContainer: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  kidsText: { fontSize: 26, fontWeight: '800' },
  activeCheckBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: '#10B981', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000000' },
  addIconCircle: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#4B4B4D', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  profileName: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', textAlign: 'center' },
  nameInput: { color: '#FFFFFF', fontSize: 12, fontWeight: '500', textAlign: 'center', width: '100%', paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: '#374151' },
  activeNameInput: { borderBottomColor: '#10B981' },
});
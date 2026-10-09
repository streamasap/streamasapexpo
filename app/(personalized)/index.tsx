import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { prefetchCatalogData } from '../../services/catalogPrefetch';

const GENRES = [
  'Action',
  'Comedy',
  'Romance',
  'Horror',
  'Thriller',
  'Drama',
  'Sci-Fi',
  'Adventure',
  'Family',
  'Animation',
];

export default function GenreSelectionScreen() {
  const router = useRouter();

  useEffect(() => {
    // Pre-warm catalog in background during genre personalization
    prefetchCatalogData().catch(() => {});
  }, []);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((item) => item !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const isButtonEnabled = selectedGenres.length >= 3;

  const handleContinue = async () => {
    if (!isButtonEnabled) return;
    try {
      // Save selected genres to local storage
      await AsyncStorage.setItem('@selected_genres', JSON.stringify(selectedGenres));
    } catch (e) {
      console.error('Failed to save genres to local DB', e);
    }
    router.push('/(personalized)/whosWatching');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>What Do You Love to Watch?</Text>
          <Text style={styles.subtitle}>
            Pick a few genres and we'll personalize your recommendations.
          </Text>
          <Text style={styles.requirementText}>Select at least 3 to continue</Text>
        </View>

        <View style={styles.gridContainer}>
          {GENRES.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <TouchableOpacity
                key={genre}
                activeOpacity={0.8}
                onPress={() => toggleGenre(genre)}
                style={styles.gridItemWrapper}>
                <LinearGradient
                  colors={
                    isSelected
                      ? ['#0088CC', '#2A1B60', '#4A154B']
                      : ['#0B2533', '#16132A', '#1C0D26']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.gridCard,
                    isSelected && styles.selectedBorder,
                  ]}>
                  <Text style={styles.genreText}>{genre}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            activeOpacity={isButtonEnabled ? 0.85 : 1}
            disabled={!isButtonEnabled}
            style={styles.buttonTouchable}
            onPress={handleContinue}>
            {isButtonEnabled ? (
              <LinearGradient
                colors={['#4C40F7', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Continue</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.actionButton, styles.disabledButton]}>
                <Text style={styles.disabledButtonText}>Continue</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 10, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: '#A1A1AA', textAlign: 'center', lineHeight: 17, paddingHorizontal: 20, marginBottom: 20 },
  requirementText: { fontSize: 11, color: '#A1A1AA', fontWeight: '500' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginBottom: 20 },
  gridItemWrapper: { width: '30%', aspectRatio: 1.05 },
  gridCard: { flex: 1, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1, borderColor: '#181824' },
  selectedBorder: { borderColor: '#38BDF8', borderWidth: 1 },
  genreText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  ctaWrapper: { marginTop: 'auto', alignItems: 'center', paddingTop: 24 },
  buttonTouchable: { width: '80%' },
  actionButton: { width: '100%', height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#3A3A3C' },
  actionButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disabledButtonText: { color: '#8E8E93', fontSize: 15, fontWeight: '700' },
});
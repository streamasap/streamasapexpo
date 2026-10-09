import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../context/Api';
import {
  getCachedContinueWatching,
  getInMemoryContinueWatching,
  smartMergeList,
  CONTINUE_WATCHING_CACHE_KEY,
} from '../../services/catalogPrefetch';

const WATCH_HISTORY_KEY = 'STREAMASAP_WATCH_HISTORY';

export interface ContinueWatchingItem {
  id: string;
  tmdbId?: number;
  imdbId?: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  backdrop?: string;
  overview?: string;
  year?: number;
  score?: number;
  subjectType?: number;
  progress?: number; // e.g., percentage watched (optional)
}

export function ContinueWatching() {
  const router = useRouter();
  // Synchronous initialization with in-memory pre-warmed data
  const [items, setItems] = useState<ContinueWatchingItem[]>(() => {
    const inMem = getInMemoryContinueWatching();
    return Array.isArray(inMem) && inMem.length > 0 ? inMem.slice(0, 8) : [];
  });

  useEffect(() => {
    let isMounted = true;

    async function loadContinueWatchingData() {
      try {
        // 1. Check local watch history from AsyncStorage
        const localHistory = await AsyncStorage.getItem(WATCH_HISTORY_KEY);
        let parsedHistory: ContinueWatchingItem[] = localHistory
          ? JSON.parse(localHistory)
          : [];

        if (parsedHistory.length > 0) {
          if (isMounted) {
            setItems(parsedHistory.slice(0, 8));
          }
          return;
        }

        // 2. Instantly check pre-warmed continue watching cache
        const cachedCW = await getCachedContinueWatching();
        if (isMounted && Array.isArray(cachedCW) && cachedCW.length > 0) {
          setItems(cachedCW.slice(0, 8));
        }

        // 3. Revalidate in the background
        const response = await fetch(`${API_BASE_URL}/movies/home`);
        const payload = await response.json();

        if (isMounted && response.ok && payload.success && payload.data) {
          const incomingList: ContinueWatchingItem[] =
            payload.data.continueWatching ||
            payload.data.recommendations ||
            payload.data.trending ||
            [];

          setItems((prev) => {
            const merged = smartMergeList(prev, incomingList);
            AsyncStorage.setItem(CONTINUE_WATCHING_CACHE_KEY, JSON.stringify(merged)).catch(() => {});
            return merged.slice(0, 8);
          });
        }
      } catch (error) {
        // Silently retain cached items
      }
    }

    loadContinueWatchingData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNavigateToWatch = (item: ContinueWatchingItem) => {
    router.push({
      pathname: '/watch',
      params: {
        id: item.id,
        title: item.title || item.name || '',
        backdrop: item.backdrop || item.thumbnail || '',
        overview: item.overview || '',
        year: item.year || '',
        score: item.score || '',
        subjectType: item.subjectType || 1,
      },
    } as any);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Continue Watching</Text>
      <View style={styles.gridContainer}>
        {items.map((item) => {
          const imageUri = item.backdrop || item.thumbnail;
          const title = item.title || item.name || 'Untitled';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={styles.cardWrapper}
              onPress={() => handleNavigateToWatch(item)}>
              <Image
                source={
                  imageUri
                    ? { uri: imageUri }
                    : require('../../assets/images/mov1.png')
                }
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.cardOverlay}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  loadingWrapper: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  cardWrapper: {
    // 2-column layout: 48% width makes the cards significantly larger
    width: '48%',
    aspectRatio: 1.6,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#1E1E24',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
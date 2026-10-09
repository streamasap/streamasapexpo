import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../context/Api';
import {
  getCachedCatalog,
  getInMemoryTrending,
  smartMergeList,
  CATALOG_CACHE_KEY,
} from '../../services/catalogPrefetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyList, toggleMyListItem, MyListItem } from '../../services/myListStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_GAP = 14;
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

interface TrendingMovieItem {
  id: string;
  tmdbId?: number;
  title?: string;
  name?: string;
  thumbnail?: string;
  backdrop?: string;
  score?: number;
  year?: number;
  overview?: string;
  subjectType?: number;
}

export function HeroCarousel() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const hasInitialScrolled = useRef<boolean>(false);

  // Synchronously initialize with in-memory pre-warmed movies for zero-second mount
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovieItem[]>(() => {
    const mem = getInMemoryTrending();
    return Array.isArray(mem) && mem.length > 0 ? mem.slice(0, 6) : [];
  });
  const [myListIds, setMyListIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // 1. Fetch saved list IDs to determine active button states
      const savedList = await getMyList();
      if (isMounted) {
        setMyListIds(new Set(savedList.map((i) => i.id)));
      }

      // 2. Read catalog from local prefetch cache (if memory was empty)
      const cached = await getCachedCatalog();
      if (isMounted && cached && cached.length > 0) {
        const top6 = cached.slice(0, 6);
        setTrendingMovies(top6);
        if (!hasInitialScrolled.current && top6.length > 1) {
          hasInitialScrolled.current = true;
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              x: ITEM_FULL_WIDTH,
              animated: false,
            });
          }, 60);
        }
      }

      // 3. Revalidate catalog with network in the background
      try {
        const response = await fetch(`${API_BASE_URL}/movies/home`);
        const payload = await response.json();

        if (isMounted && response.ok && payload.success && payload.data?.trending) {
          const incoming = payload.data.trending;

          // Smart in-place merge strictly capped at 6 items
          setTrendingMovies((prev) => {
            const updated = smartMergeList(prev, incoming).slice(0, 6);
            AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(updated)).catch(() => {});
            return updated;
          });

          if (!hasInitialScrolled.current && incoming.length > 1) {
            hasInitialScrolled.current = true;
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({
                x: ITEM_FULL_WIDTH,
                animated: false,
              });
            }, 60);
          }
        }
      } catch (error) {
        // Silently preserve existing cached movies on network error
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleMyList = async (item: TrendingMovieItem) => {
    const listObj: MyListItem = {
      id: item.id,
      tmdbId: item.tmdbId,
      title: item.title || item.name,
      backdrop: item.backdrop,
      thumbnail: item.thumbnail,
      year: item.year,
      overview: item.overview,
      score: item.score,
      subjectType: item.subjectType,
    };

    // Optimistically toggle state instantly
    setMyListIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(item.id)) {
        updated.delete(item.id);
      } else {
        updated.add(item.id);
      }
      return updated;
    });

    // Save change to local storage
    await toggleMyListItem(listObj);
  };

  const handleNavigateToWatch = (item: TrendingMovieItem) => {
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

  if (trendingMovies.length === 0) {
    return <View style={styles.scrollContent} />;
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      snapToInterval={ITEM_FULL_WIDTH}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {trendingMovies.map((item) => {
        const movieTitle = item.title || item.name || 'Untitled';
        const imageUri = item.backdrop || item.thumbnail;
        const isSaved = myListIds.has(item.id);

        return (
          <View key={item.id} style={styles.cardContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.cardTouchArea}
              onPress={() => handleNavigateToWatch(item)}>
              <ImageBackground
                source={
                  imageUri
                    ? { uri: imageUri }
                    : require('../../assets/images/mov1.png')
                }
                style={styles.imageBackground}
                imageStyle={styles.imageStyle}>
                <View style={styles.overlay}>
                  <Text style={styles.movieTitle} numberOfLines={1}>
                    {movieTitle}
                  </Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.watchNowBtn}
                      onPress={() => handleNavigateToWatch(item)}>
                      <Text style={styles.watchNowText}>Watch Now</Text>
                    </TouchableOpacity>

                    {/* Shared background styling for both states */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.myListBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleMyList(item);
                      }}>
                      <Ionicons
                        name={isSaved ? 'checkmark' : 'add'}
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.myListText}>
                        {isSaved ? 'Remove' : 'My List'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SIDE_PADDING,
    gap: CARD_GAP,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 380,
    borderRadius: 20,
    overflow: 'hidden',
  },
  skeletonBg: {
    backgroundColor: '#10121D',
    borderRadius: 20,
  },
  cardTouchArea: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 20,
  },
  overlay: {
    padding: 16,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  watchNowBtn: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchNowText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  myListBtn: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  myListText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../context/Api';
import { getInMemoryTrending, getCachedCatalog, smartMergeList } from '../../services/catalogPrefetch';

export interface CatalogMovieItem {
  id: string;
  tmdbId?: number;
  imdbId?: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  backdrop?: string;
  year?: number;
  genre?: string;
  subjectType?: number;
  score?: number;
  overview?: string;
}

export interface TrendingNowProps {
  searchResults?: CatalogMovieItem[];
  loading?: boolean;
  sectionTitle?: string;
}

export function TrendingNow({
  searchResults,
  loading = false,
  sectionTitle = 'Trending Now',
}: TrendingNowProps) {
  const router = useRouter();

  // Synchronously initialize with in-memory pre-warmed catalog
  const [defaultTrending, setDefaultTrending] = useState<CatalogMovieItem[]>(() => {
    const inMem = getInMemoryTrending();
    return Array.isArray(inMem) && inMem.length > 0 ? inMem : [];
  });

  // Revalidate trending catalog in background if no active search results
  useEffect(() => {
    let isMounted = true;

    async function loadTrendingCatalog() {
      if (searchResults && searchResults.length > 0) return;

      // Check local cache if memory state was empty
      if (defaultTrending.length === 0) {
        const cached = await getCachedCatalog();
        if (isMounted && cached && cached.length > 0) {
          setDefaultTrending(cached);
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/movies/home`);
        const json = await response.json();

        if (isMounted && json.success && json.data?.trending) {
          setDefaultTrending((prev) => smartMergeList(prev, json.data.trending));
        }
      } catch (err) {
        // Silently retain cached items
      }
    }

    loadTrendingCatalog();

    return () => {
      isMounted = false;
    };
  }, [searchResults]);

  const displayItems = searchResults !== undefined ? searchResults : defaultTrending;
  // Only show spinner when actively running a search query
  const isActivelySearching = loading && searchResults === undefined;

  const handleNavigateToWatch = (item: CatalogMovieItem) => {
    router.push({
      pathname: '/watch',
      params: {
        id: item.id,
        title: item.title || item.name || '',
        backdrop: item.backdrop || item.thumbnail || '',
        overview: item.overview || '',
        year: item.year ? String(item.year) : '',
        score: item.score ? String(item.score) : '',
        subjectType: item.subjectType ? String(item.subjectType) : '1',
      },
    } as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>

      {isActivelySearching ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      ) : displayItems.length > 0 ? (
        <View style={styles.gridContainer}>
          {displayItems.map((item) => {
            const movieTitle = item.title || item.name || 'Untitled';
            const imageUri = item.thumbnail || item.backdrop;
            const yearText = item.year ? `${item.year}` : 'N/A';
            const genreText = item.genre || (item.subjectType === 2 ? 'Series' : 'Movie');

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
                  style={styles.poster}
                  resizeMode="cover"
                />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {movieTitle}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {yearText} • {genreText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No titles found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 36,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  loaderBox: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cardWrapper: {
    width: '31%',
    marginBottom: 10,
  },
  poster: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#1E1E24',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 9,
    color: '#8E8E93',
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
});
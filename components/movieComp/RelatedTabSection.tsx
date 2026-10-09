import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SubjectDetails } from '../../app/(tabs)/watch';
import { API_BASE_URL } from '../../context/Api';

const TAB_BAR_HEIGHT = 80;

export interface RelatedMovie {
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
}

export interface Episode {
  id: number;
  episode: number;
  season: number;
  title: string;
  overview?: string;
  still?: string;
}

export interface RelatedTabSectionProps {
  details?: SubjectDetails | null;
  selectedSeason?: number;
  selectedEpisode?: number;
  onSelectEpisode?: (season: number, episode: number) => void;
}

export function RelatedTabSection({
  details,
  selectedSeason = 1,
  selectedEpisode = 1,
  onSelectEpisode,
}: RelatedTabSectionProps) {
  const router = useRouter();
  const isSeries = details?.subjectType === 2;

  const [activeTab, setActiveTab] = useState<'episodes' | 'related' | 'comments' | 'casts'>(
    isSeries ? 'episodes' : 'related'
  );

  const [currentSeason, setCurrentSeason] = useState<number>(selectedSeason);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);

  // Related Movies State
  const [relatedMovies, setRelatedMovies] = useState<RelatedMovie[]>([]);
  const [loadingRelated, setLoadingRelated] = useState<boolean>(false);

  const insets = useSafeAreaInsets();
  const bottomPadding = TAB_BAR_HEIGHT + Math.max(insets.bottom, 16) + 20;

  useEffect(() => {
    if (isSeries) {
      setActiveTab('episodes');
    } else {
      setActiveTab('related');
    }
  }, [isSeries]);

  // Fetch Season Episodes
  useEffect(() => {
    let isMounted = true;

    async function fetchEpisodes() {
      if (!isSeries || !details?.tmdbId) return;

      try {
        setLoadingEpisodes(true);
        const response = await fetch(
          `${API_BASE_URL}/movies/series/${details.tmdbId}/seasons/${currentSeason}`
        );
        const json = await response.json();

        if (isMounted && json.status === 'success' && json.data?.episodes) {
          setEpisodes(json.data.episodes);
        }
      } catch (err) {
        console.error('Error fetching season episodes:', err);
      } finally {
        if (isMounted) setLoadingEpisodes(false);
      }
    }

    fetchEpisodes();

    return () => {
      isMounted = false;
    };
  }, [details?.tmdbId, currentSeason, isSeries]);

  // Fetch Dynamic Related Movies
  useEffect(() => {
    let isMounted = true;

    async function fetchRelatedMovies() {
      if (!details?.id) return;

      try {
        setLoadingRelated(true);
        const response = await fetch(`${API_BASE_URL}/movies/titles/${details.id}/related`);
        const json = await response.json();

        if (isMounted && json.data && Array.isArray(json.data)) {
          setRelatedMovies(json.data);
        }
      } catch (err) {
        console.error('Error fetching related movies:', err);
      } finally {
        if (isMounted) setLoadingRelated(false);
      }
    }

    if (activeTab === 'related') {
      fetchRelatedMovies();
    }

    return () => {
      isMounted = false;
    };
  }, [details?.id, activeTab]);

  const handleSeasonChange = (seasonNum: number) => {
    setCurrentSeason(seasonNum);
  };

  const handleEpisodePress = (episodeNum: number) => {
    if (onSelectEpisode) {
      onSelectEpisode(currentSeason, episodeNum);
    }
  };

  const handleNavigateToRelated = (item: RelatedMovie) => {
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
      {/* Tabs Selector Bar */}
      <View style={styles.tabsRow}>
        {isSeries && (
          <TouchableOpacity
            onPress={() => setActiveTab('episodes')}
            style={[styles.tabPill, activeTab === 'episodes' && styles.activeTabPill]}>
            <Text style={[styles.tabText, activeTab === 'episodes' && styles.activeTabText]}>
              Episodes
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setActiveTab('related')}
          style={[styles.tabPill, activeTab === 'related' && styles.activeTabPill]}>
          <Text style={[styles.tabText, activeTab === 'related' && styles.activeTabText]}>
            Related
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('comments')}
          style={[styles.tabPill, activeTab === 'comments' && styles.activeTabPill]}>
          <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>
            Comments <Text style={styles.commentCount}>(99+)</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('casts')}
          style={[styles.tabPill, activeTab === 'casts' && styles.activeTabPill]}>
          <Text style={[styles.tabText, activeTab === 'casts' && styles.activeTabText]}>
            Casts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Episodes Tab */}
      {isSeries && activeTab === 'episodes' && (
        <View style={styles.episodesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonRow}>
            {[1, 2, 3, 4, 5].map((seasonNum) => (
              <TouchableOpacity
                key={seasonNum}
                style={[
                  styles.seasonPill,
                  currentSeason === seasonNum && styles.activeSeasonPill,
                ]}
                onPress={() => handleSeasonChange(seasonNum)}>
                <Text
                  style={[
                    styles.seasonText,
                    currentSeason === seasonNum && styles.activeSeasonText,
                  ]}>
                  Season {seasonNum}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loadingEpisodes ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loaderText}>Loading season episodes...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={[styles.episodesList, { paddingBottom: bottomPadding }]}
              showsVerticalScrollIndicator={false}>
              {episodes.map((ep) => {
                const isSelected = selectedEpisode === ep.episode && selectedSeason === currentSeason;

                return (
                  <TouchableOpacity
                    key={ep.id || ep.episode}
                    activeOpacity={0.8}
                    style={[styles.episodeCard, isSelected && styles.activeEpisodeCard]}
                    onPress={() => handleEpisodePress(ep.episode)}>
                    {ep.still ? (
                      <Image source={{ uri: ep.still }} style={styles.episodeStill} />
                    ) : (
                      <View style={styles.episodeStillPlaceholder}>
                        <Ionicons name="play" size={20} color="#FFFFFF" />
                      </View>
                    )}

                    <View style={styles.episodeDetails}>
                      <Text style={styles.episodeTitle} numberOfLines={1}>
                        {ep.episode}. {ep.title || `Episode ${ep.episode}`}
                      </Text>
                      {ep.overview ? (
                        <Text style={styles.episodeOverview} numberOfLines={2}>
                          {ep.overview}
                        </Text>
                      ) : null}
                    </View>

                    {isSelected && (
                      <View style={styles.playingBadge}>
                        <Ionicons name="stats-chart" size={14} color="#3B82F6" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* Dynamic Related Movies Tab */}
      {activeTab === 'related' && (
        loadingRelated ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loaderText}>Fetching related titles...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[styles.gridContainer, { paddingBottom: bottomPadding }]}
            showsVerticalScrollIndicator={false}
            bounces={true}>
            {relatedMovies.map((item) => {
              const imageUri = item.thumbnail || item.backdrop;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={styles.posterCard}
                  onPress={() => handleNavigateToRelated(item)}>
                  <Image
                    source={
                      imageUri
                        ? { uri: imageUri }
                        : require('../../assets/images/mov1.png')
                    }
                    style={styles.posterImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )
      )}

      {activeTab === 'comments' && (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding }}>
          <Text style={styles.placeholderText}>Comments section content...</Text>
        </ScrollView>
      )}

      {activeTab === 'casts' && (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPadding }}>
          <Text style={styles.placeholderText}>Casts section content...</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  tabPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  activeTabPill: {
    backgroundColor: '#1E202C',
  },
  tabText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  commentCount: {
    color: '#3B82F6',
  },
  episodesContainer: {
    flex: 1,
  },
  seasonRow: {
    paddingHorizontal: 16,
    marginBottom: 12,
    maxHeight: 36,
  },
  seasonPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#121420',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#24273A',
  },
  activeSeasonPill: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  seasonText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeSeasonText: {
    color: '#FFFFFF',
  },
  loaderBox: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  scrollArea: {
    flex: 1,
  },
  episodesList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F111D',
    borderRadius: 10,
    padding: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1C1F30',
  },
  activeEpisodeCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#15192D',
  },
  episodeStill: {
    width: 80,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#1A1C2C',
  },
  episodeStillPlaceholder: {
    width: 80,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#1A1C2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeDetails: {
    flex: 1,
  },
  episodeTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  episodeOverview: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 15,
  },
  playingBadge: {
    paddingRight: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    rowGap: 12,
  },
  posterCard: {
    width: '31%',
    aspectRatio: 0.7,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#181926',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 20,
  },
});
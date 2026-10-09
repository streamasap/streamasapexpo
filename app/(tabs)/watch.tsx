import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { VideoPreview } from '../../components/movieComp/VideoPreview';
import { MovieMetaInfo } from '../../components/movieComp/MovieMetaInfo';
import { RelatedTabSection } from '../../components/movieComp/RelatedTabSection';
import { API_BASE_URL } from '../../context/Api';
import { getCachedTitle } from '../../services/catalogPrefetch';
import { isInMyList, toggleMyListItem, MyListItem } from '../../services/myListStorage';
import { saveDownloadItem, isDownloaded } from '../../services/downloadsStorage';

export interface SubjectDetails {
  id: string;
  tmdbId?: number;
  imdbId?: string;
  imdb_id?: string;
  title?: string;
  name?: string;
  description?: string;
  overview?: string;
  backdrop?: string;
  thumbnail?: string;
  subjectType?: number;
  year?: number;
  score?: number;
}

const WATCH_HISTORY_KEY = 'STREAMASAP_WATCH_HISTORY';

export default function WatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    backdrop?: string;
    overview?: string;
    year?: string;
    score?: string;
    subjectType?: string;
  }>();

  const titleId = params.id || 'tmdb-movie-603692';

  // Seed metadata immediately from route params so UI shell renders with zero delay
  const [details, setDetails] = useState<SubjectDetails | null>(() => ({
    id: titleId,
    title: params.title || '',
    backdrop: params.backdrop || '',
    overview: params.overview || '',
    year: params.year ? parseInt(params.year, 10) : undefined,
    score: params.score ? parseFloat(params.score) : undefined,
    subjectType: params.subjectType ? parseInt(params.subjectType, 10) : 1,
  }));

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLoading, setStreamLoading] = useState<boolean>(true);

  // Local storage state flags
  const [isSavedInMyList, setIsSavedInMyList] = useState<boolean>(false);
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);

  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);

  // Helper function to persist opened title into Continue Watching history
  const saveToWatchHistory = async (item: SubjectDetails) => {
    if (!item || !item.id) return;

    try {
      const existingHistory = await AsyncStorage.getItem(WATCH_HISTORY_KEY);
      let historyList: SubjectDetails[] = existingHistory
        ? JSON.parse(existingHistory)
        : [];

      // 1. Remove duplicate if it exists
      historyList = historyList.filter((h) => h.id !== item.id);

      // 2. Prepend latest title to top of list
      historyList.unshift(item);

      // 3. Keep maximum 10 recent items
      await AsyncStorage.setItem(
        WATCH_HISTORY_KEY,
        JSON.stringify(historyList.slice(0, 10))
      );
    } catch (err) {
      console.error('Error persisting watch history:', err);
    }
  };

  // 1. Fetch title metadata, verify local storage status, and trigger stream retrieval
  useEffect(() => {
    let isMounted = true;

    async function loadTitleData() {
      // Check My List & Downloaded local storage status
      const [inList, downloaded] = await Promise.all([
        isInMyList(titleId),
        isDownloaded(titleId),
      ]);

      if (isMounted) {
        setIsSavedInMyList(inList);
        setHasDownloaded(downloaded);
      }

      // Step A: Load local cached version first
      const cached = await getCachedTitle(titleId);
      if (isMounted && cached) {
        const mergedCached = { ...details, ...cached };
        setDetails(mergedCached);
        saveToWatchHistory(mergedCached);

        const cachedImdb = cached.imdbId || cached.imdb_id || cached.id;
        if (cachedImdb && cachedImdb.startsWith('tt')) {
          fetchStream(cachedImdb, 1, 1, cached.subjectType);
        }
      }

      // Step B: Fetch fresh metadata from API
      try {
        const res = await fetch(`${API_BASE_URL}/movies/titles/${titleId}`);
        const json = await res.json();

        if (isMounted && json.status === 'success' && json.data) {
          const subject = json.data.subject || json.data;
          const mergedSubject = { ...details, ...subject };

          setDetails(mergedSubject);
          saveToWatchHistory(mergedSubject);

          // Resolve exact IMDb ID (e.g. tt1234567) from subject metadata
          const activeImdbId =
            subject.imdbId ||
            subject.imdb_id ||
            subject.imdb ||
            (titleId.startsWith('tt') ? titleId : null);

          if (activeImdbId) {
            fetchStream(activeImdbId, 1, 1, subject.subjectType);
          } else {
            console.warn('No IMDb ID found for title:', titleId);
            setStreamLoading(false);
            setStreamUrl(null);
          }
        }
      } catch (err) {
        console.error('Error fetching title details:', err);
        setStreamLoading(false);
      }
    }

    if (titleId) {
      loadTitleData();
    }

    return () => {
      isMounted = false;
    };
  }, [titleId]);

  // 2. Stream selector with native-friendly container filtering & quality sorting
  const fetchStream = async (
    idStr: string,
    seasonNum: number,
    epNum: number,
    type?: number
  ) => {
    try {
      setStreamLoading(true);
      setStreamUrl(null);

      let endpoint = `${API_BASE_URL}/movies/streams/${idStr}`;
      if (type === 2) {
        endpoint += `?season=${seasonNum}&episode=${epNum}`;
      }

      const res = await fetch(endpoint);
      const json = await res.json();

      const dataObj = json.data || json;
      const rawSources =
        dataObj.processedSources ||
        dataObj.sources ||
        (Array.isArray(dataObj) ? dataObj : []);

      if (Array.isArray(rawSources) && rawSources.length > 0) {
        // Step A: Filter sources marked streamable
        const validSources = rawSources.filter(
          (s: any) =>
            s.canStream !== false && (s.streamUrl || s.directUrl || s.url)
        );

        const getUrl = (s: any) =>
          (s.streamUrl || s.directUrl || s.url || '').toLowerCase();

        // Step B: Prioritize native-friendly containers (.mp4, .m3u8) over .mkv and .mpd
        const nativeFriendly = validSources.filter((s: any) => {
          const url = getUrl(s);
          return (
            (url.includes('.mp4') ||
              url.includes('.m3u8') ||
              s.format === 'mp4') &&
            !url.includes('.mpd') &&
            !url.endsWith('.mkv')
          );
        });

        const candidatePool =
          nativeFriendly.length > 0 ? nativeFriendly : validSources;

        // Step C: Sort by Quality (1080p -> 720p -> 480p)
        candidatePool.sort((a: any, b: any) => {
          const qA =
            typeof a.quality === 'number'
              ? a.quality
              : parseInt(a.quality || '0', 10);
          const qB =
            typeof b.quality === 'number'
              ? b.quality
              : parseInt(b.quality || '0', 10);
          return qB - qA;
        });

        const best = candidatePool[0];
        const finalUrl = best
          ? best.streamUrl || best.directUrl || best.url
          : null;

        console.log('Selected Optimal Stream Source:', {
          provider: best?.provider || best?.name,
          quality: best?.quality,
          url: finalUrl,
        });

        setStreamUrl(finalUrl);
      } else {
        setStreamUrl(null);
      }
    } catch (err) {
      console.error('Error loading stream URL:', err);
      setStreamUrl(null);
    } finally {
      setStreamLoading(false);
    }
  };

  // Toggle My List item
  const handleToggleMyList = async () => {
    if (!details) return;

    const listObj: MyListItem = {
      id: details.id,
      tmdbId: details.tmdbId,
      imdbId: details.imdbId,
      title: details.title || details.name,
      backdrop: details.backdrop,
      thumbnail: details.thumbnail,
      year: details.year,
      overview: details.overview,
      score: details.score,
      subjectType: details.subjectType,
    };

    setIsSavedInMyList((prev) => !prev);
    await toggleMyListItem(listObj);
  };

  // Save to Downloads
  const handleDownload = async () => {
    if (!details) return;

    await saveDownloadItem({
      id: details.id,
      tmdbId: details.tmdbId,
      imdbId: details.imdbId,
      title: details.title || details.name || 'Untitled',
      image: details.thumbnail || details.backdrop,
      backdrop: details.backdrop,
      overview: details.overview,
      year: details.year,
      score: details.score,
      subjectType: details.subjectType,
      fileSize: details.subjectType === 2 ? '1.2 GB' : '850 MB',
      quality: '1080p',
    });

    setHasDownloaded(true);
    Alert.alert('Download Complete', `${details.title || details.name} saved to Downloads!`);
  };

  const handleEpisodeChange = (season: number, episode: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);

    const activeImdbId =
      details?.imdbId ||
      (details as any)?.imdb_id ||
      (titleId.startsWith('tt') ? titleId : null);

    if (activeImdbId) {
      fetchStream(activeImdbId, season, episode, details?.subjectType);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {details?.title || details?.name || 'Watch'}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Video Preview / Player */}
      <VideoPreview
        streamUrl={streamUrl}
        posterUri={details?.backdrop || details?.thumbnail}
        loading={streamLoading}
      />

      {/* Movie or Series Meta Info */}
      <MovieMetaInfo details={details} />

      {/* Action Buttons */}
      <View style={styles.container1}>
        <TouchableOpacity activeOpacity={0.85} style={styles.watchNowBtn}>
          <Text style={styles.watchNowText}>Watch Now</Text>
        </TouchableOpacity>

        {/* Save to Offline Downloads Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.secondaryBtn}
          onPress={handleDownload}>
          <Ionicons
            name={hasDownloaded ? 'checkmark-circle' : 'download-outline'}
            size={16}
            color={hasDownloaded ? '#3B82F6' : '#FFFFFF'}
          />
          <Text style={styles.secondaryBtnText}>
            {hasDownloaded ? 'Downloaded' : 'Download'}
          </Text>
        </TouchableOpacity>

        {/* Toggle My List Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.secondaryBtn}
          onPress={handleToggleMyList}>
          <Ionicons
            name={isSavedInMyList ? 'checkmark' : 'add'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.secondaryBtnText}>
            {isSavedInMyList ? 'Remove' : 'My List'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Section (Episodes / Related / More Like This) */}
      <RelatedTabSection
        details={details}
        selectedSeason={selectedSeason}
        selectedEpisode={selectedEpisode}
        onSelectEpisode={handleEpisodeChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  container1: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  watchNowBtn: {
    flex: 1.2,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchNowText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1E202C',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
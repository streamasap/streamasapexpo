import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  getDownloads,
  removeDownloadItem,
  updateDownloadProgress,
  DownloadItem,
} from '../../services/downloadsStorage';

export default function DownloadsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = 58 + Math.max(insets.bottom, 10) + 24;

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load downloads from AsyncStorage on focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadOfflineDownloads() {
        setLoading(true);
        const stored = await getDownloads();
        if (isMounted) {
          setDownloads(stored);
          setLoading(false);
        }
      }

      loadOfflineDownloads();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  // Simulate downloading progress progression for items currently in "downloading" state
  useEffect(() => {
    const activeDownloads = downloads.filter(
      (item) => item.status === 'downloading' && (item.progress ?? 0) < 100
    );

    if (activeDownloads.length === 0) return;

    const interval = setInterval(async () => {
      setDownloads((prevDownloads) =>
        prevDownloads.map((item) => {
          if (item.status === 'downloading' && (item.progress ?? 0) < 100) {
            const newProgress = Math.min(100, (item.progress ?? 0) + 10);
            const newStatus = newProgress >= 100 ? 'completed' : 'downloading';

            // Sync with AsyncStorage in background
            updateDownloadProgress(item.id, newProgress, newStatus);

            return {
              ...item,
              progress: newProgress,
              status: newStatus,
            };
          }
          return item;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [downloads]);

  const handleRemoveItem = async (id: string) => {
    setDownloads((prev) => prev.filter((item) => item.id !== id));
    await removeDownloadItem(id);
  };

  const handleWatchPress = (item: DownloadItem) => {
    router.push({
      pathname: '/watch',
      params: {
        id: item.id,
        title: item.title,
        backdrop: item.backdrop || item.image || '',
        overview: item.overview || '',
        year: item.year ? String(item.year) : '',
        score: item.score ? String(item.score) : '',
        subjectType: item.subjectType ? String(item.subjectType) : '1',
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Downloads</Text>

        <TouchableOpacity activeOpacity={0.7} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
          <Text style={styles.settingsBtnText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never">
        
        {loading && downloads.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : downloads.length > 0 ? (
          <View style={styles.listContainer}>
            {downloads.map((item) => {
              const imageUri = item.image || item.backdrop;
              const genreText = item.genre || (item.subjectType === 2 ? 'Series' : 'Movie');
              const qualityText = item.quality || '1080p';
              const sizeText = item.fileSize || '750 MB';
              const currentProgress = item.progress ?? 0;
              const isDownloading = item.status === 'downloading' && currentProgress < 100;

              return (
                <View key={item.id} style={styles.card}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleWatchPress(item)}>
                    <Image
                      source={
                        imageUri
                          ? { uri: imageUri }
                          : require('../../assets/images/mov1.png')
                      }
                      style={styles.poster}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>

                  <View style={styles.infoContainer}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleWatchPress(item)}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.metaText}>
                      {genreText} • {item.durationOrSeasons || (item.subjectType === 2 ? 'TV Show' : 'Movie')}
                    </Text>

                    {/* Quality and Size Row */}
                    <View style={styles.metaRow}>
                      {item.type === 'series' || item.subjectType === 2 ? (
                        <Text style={styles.metaText}>
                          {item.totalEpisodes || 'Downloaded Episodes'} • {sizeText}
                        </Text>
                      ) : (
                        <Text style={styles.metaText}>
                          Quality: {qualityText} • {sizeText}
                        </Text>
                      )}
                    </View>

                    {/* White Progress Bar for Downloading Items */}
                    {isDownloading && (
                      <View style={styles.progressSection}>
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${currentProgress}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          Downloading... {currentProgress}%
                        </Text>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={[
                          styles.playBtn,
                          isDownloading && styles.playBtnDisabled,
                        ]}
                        disabled={isDownloading}
                        onPress={() => handleWatchPress(item)}>
                        <Ionicons
                          name={isDownloading ? 'cloud-download' : 'play'}
                          size={14}
                          color="#000000"
                        />
                        <Text style={styles.playText}>
                          {isDownloading ? 'Downloading' : 'Watch'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.deleteBtn}
                        onPress={() => handleRemoveItem(item.id)}>
                        <Ionicons name="trash-outline" size={14} color="#FF453A" />
                        <Text style={styles.deleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color="#A1A1AA" />
            <Text style={styles.emptyText}>No downloaded content</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#05060A',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E28',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E2E3E',
  },
  settingsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#0D0E15',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  poster: {
    width: 90,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#1A1B23',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaRow: {
    marginTop: 4,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#E4E4E7',
  },
  progressSection: {
    marginBottom: 8,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#202230',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF', // Solid white progress bar
    borderRadius: 2,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  playBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
    gap: 4,
  },
  playBtnDisabled: {
    backgroundColor: '#A1A1AA',
    opacity: 0.8,
  },
  playText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteText: {
    color: '#FF453A',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
});
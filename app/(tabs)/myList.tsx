import React, { useState, useCallback } from 'react';
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
import { ContinueWatching } from '../../components/tabsHome/ContinueWatching';
import { getMyList, removeMyListItem, MyListItem } from '../../services/myListStorage';

export default function MyListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = 58 + Math.max(insets.bottom, 10) + 24;

  const [savedItems, setSavedItems] = useState<MyListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadSavedList() {
        const items = await getMyList();
        if (isMounted) {
          setSavedItems(items);
          setLoading(false);
        }
      }

      loadSavedList();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleRemoveItem = async (id: string) => {
    // Optimistically update state locally
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    await removeMyListItem(id);
  };

  const handleNavigateToWatch = (item: MyListItem) => {
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header outside ScrollView */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My List</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never">

        {loading && savedItems.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : savedItems.length > 0 ? (
          <View style={styles.listContainer}>
            {savedItems.map((item) => {
              const itemTitle = item.title || item.name || 'Untitled';
              const imageUri = item.thumbnail || item.backdrop;
              const yearText = item.year ? `${item.year}` : 'N/A';
              const genreText = item.genre || (item.subjectType === 2 ? 'Series' : 'Movie');
              const durationText = item.durationOrSeasons || (item.subjectType === 2 ? 'TV Show' : 'Movie');

              return (
                <View key={item.id} style={styles.card}>
                  <TouchableOpacity
                    activeOpacity={0.85}
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
                  </TouchableOpacity>

                  <View style={styles.infoContainer}>
                    <View style={styles.titleRow}>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={0.85}
                        onPress={() => handleNavigateToWatch(item)}>
                        <Text style={styles.itemTitle} numberOfLines={1}>
                          {itemTitle}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRemoveItem(item.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemMeta}>
                      {yearText} • {genreText} • {durationText}
                    </Text>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.watchNowBtn}
                        onPress={() => handleNavigateToWatch(item)}>
                        <Text style={styles.watchNowText}>Watch Now</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={styles.downloadBtn}>
                        <Text style={styles.downloadText}>Download</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={48} color="#A1A1AA" />
            <Text style={styles.emptyText}>No content in your Watch List</Text>
          </View>
        )}

        <ContinueWatching />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
  },
  scrollContent: {},
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
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#0D0E15',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 14,
  },
  poster: {
    width: 100,
    height: 120,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  watchNowBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchNowText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700',
  },
  downloadBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 40,
    gap: 12,
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
});
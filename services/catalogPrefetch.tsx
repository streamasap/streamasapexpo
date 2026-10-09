import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { API_BASE_URL } from '../context/Api';

export const CATALOG_CACHE_KEY = 'STREAMASAP_HOME_CATALOG';
export const CONTINUE_WATCHING_CACHE_KEY = 'STREAMASAP_CONTINUE_WATCHING_CACHE';
const TITLE_CACHE_PREFIX = 'STREAMASAP_TITLE_';

// Synchronous in-memory caches to guarantee 0ms instant mount without blank screens
let memoryTrendingCache: any[] = [];
let memoryCWCache: any[] = [];

export function getInMemoryTrending(): any[] {
  return memoryTrendingCache;
}

export function getInMemoryContinueWatching(): any[] {
  return memoryCWCache;
}

// Prefetch remote images into the device's native cache so they appear immediately
export function prefetchImages(items: any[]): void {
  if (!Array.isArray(items)) return;
  items.forEach((item) => {
    const uri = item.backdrop || item.thumbnail;
    if (uri && typeof uri === 'string' && (uri.startsWith('http://') || uri.startsWith('https://'))) {
      Image.prefetch(uri).catch(() => {});
    }
  });
}

// Initialize memory cache immediately from local storage on module import / app launch
export async function initializeMemoryCache(): Promise<void> {
  try {
    const [tRaw, cwRaw] = await Promise.all([
      AsyncStorage.getItem(CATALOG_CACHE_KEY),
      AsyncStorage.getItem(CONTINUE_WATCHING_CACHE_KEY),
    ]);
    if (tRaw) {
      const parsed = JSON.parse(tRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryTrendingCache = parsed.slice(0, 6);
        prefetchImages(memoryTrendingCache);
      }
    }
    if (cwRaw) {
      const parsedCW = JSON.parse(cwRaw);
      if (Array.isArray(parsedCW) && parsedCW.length > 0) {
        memoryCWCache = parsedCW;
        prefetchImages(memoryCWCache);
      }
    }
  } catch (e) {
    // Ignore init error
  }
}

// Auto-run initialization on load
initializeMemoryCache().catch(() => {});

// Smart item merger: Updates existing items in place to prevent UI flickering or layout shift
export function smartMergeList<T extends { id: string }>(
  existingList: T[],
  incomingList: T[]
): T[] {
  if (!existingList || existingList.length === 0) {
    return incomingList || [];
  }

  if (!incomingList || incomingList.length === 0) {
    return existingList;
  }

  const existingMap = new Map<string, T>(existingList.map((item) => [item.id, item]));

  const merged: T[] = incomingList.map((newItem) => {
    const prev = existingMap.get(newItem.id);
    if (!prev) return newItem;

    // Merge in place to update title, image, score smoothly
    return {
      ...prev,
      ...newItem,
    };
  });

  return merged;
}

export async function prefetchCatalogData(): Promise<void> {
  try {
    const homeRes = await fetch(`${API_BASE_URL}/movies/home`);
    const homeJson = await homeRes.json();

    if (homeRes.ok && homeJson.success && homeJson.data) {
      const incomingTrending = homeJson.data.trending || [];
      const incomingCW =
        homeJson.data.continueWatching ||
        homeJson.data.recommendations ||
        [];

      // 1. Smart update for Hero Carousel trending catalog — strictly keep 6 items
      if (Array.isArray(incomingTrending) && incomingTrending.length > 0) {
        const existingRaw = await AsyncStorage.getItem(CATALOG_CACHE_KEY);
        const existingList = existingRaw ? JSON.parse(existingRaw) : memoryTrendingCache;
        const mergedTrending = smartMergeList(existingList, incomingTrending).slice(0, 6);

        // Update in-memory cache synchronously and native image cache
        memoryTrendingCache = mergedTrending;
        prefetchImages(mergedTrending);

        await AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(mergedTrending));

        // 2. Pre-warm top 6 title details into local cache
        await Promise.all(
          mergedTrending.map(async (item: { id: string }) => {
            try {
              const detailRes = await fetch(`${API_BASE_URL}/movies/titles/${item.id}`);
              const detailJson = await detailRes.json();
              if (detailRes.ok && detailJson.status === 'success') {
                const titleData = detailJson.data.subject || detailJson.data;
                await AsyncStorage.setItem(
                  `${TITLE_CACHE_PREFIX}${item.id}`,
                  JSON.stringify(titleData)
                );
                // Also prefetch title backdrop image
                if (titleData?.backdrop || titleData?.thumbnail) {
                  Image.prefetch(titleData.backdrop || titleData.thumbnail).catch(() => {});
                }
              }
            } catch (err) {
              // Ignore background prefetch failures
            }
          })
        );
      }

      // 3. Smart update for Continue Watching / Recommendations cache
      if (Array.isArray(incomingCW) && incomingCW.length > 0) {
        const existingCWRaw = await AsyncStorage.getItem(CONTINUE_WATCHING_CACHE_KEY);
        const existingCWList = existingCWRaw ? JSON.parse(existingCWRaw) : memoryCWCache;
        const mergedCW = smartMergeList(existingCWList, incomingCW);

        // Update in-memory cache synchronously and native image cache
        memoryCWCache = mergedCW;
        prefetchImages(mergedCW);

        await AsyncStorage.setItem(CONTINUE_WATCHING_CACHE_KEY, JSON.stringify(mergedCW));
      }
    }
  } catch (err) {
    // Ignore background prefetch network errors
  }
}

export async function getCachedCatalog() {
  if (memoryTrendingCache.length > 0) return memoryTrendingCache;
  const data = await AsyncStorage.getItem(CATALOG_CACHE_KEY);
  return data ? JSON.parse(data) : null;
}

export async function getCachedContinueWatching() {
  if (memoryCWCache.length > 0) return memoryCWCache;
  const data = await AsyncStorage.getItem(CONTINUE_WATCHING_CACHE_KEY);
  return data ? JSON.parse(data) : null;
}

export async function getCachedTitle(id: string) {
  const data = await AsyncStorage.getItem(`${TITLE_CACHE_PREFIX}${id}`);
  return data ? JSON.parse(data) : null;
}
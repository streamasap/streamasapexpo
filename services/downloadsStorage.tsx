// src/services/downloadsStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DOWNLOADS_STORAGE_KEY = 'STREAMASAP_DOWNLOADS';

export interface DownloadItem {
  id: string;
  tmdbId?: number;
  imdbId?: string;
  title: string;
  genre?: string;
  type?: string;
  durationOrSeasons?: string;
  totalEpisodes?: string;
  quality?: string;
  fileSize?: string;
  image?: string;
  backdrop?: string;
  overview?: string;
  year?: number | string;
  score?: number;
  subjectType?: number;
  progress?: number; // 0 to 100
  status?: 'downloading' | 'completed' | 'paused' | 'failed';
}

export async function getDownloads(): Promise<DownloadItem[]> {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOADS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error fetching downloads from AsyncStorage:', err);
    return [];
  }
}

export async function saveDownloadItem(item: DownloadItem): Promise<DownloadItem[]> {
  try {
    const currentList = await getDownloads();
    const newItem: DownloadItem = {
      ...item,
      progress: item.progress ?? 0,
      status: item.status ?? 'downloading',
    };
    const updatedList = [newItem, ...currentList.filter((i) => i.id !== item.id)];
    await AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error('Error saving download item:', err);
    return [];
  }
}

export async function updateDownloadProgress(
  id: string,
  progress: number,
  status: 'downloading' | 'completed' | 'paused' | 'failed' = 'downloading'
): Promise<DownloadItem[]> {
  try {
    const currentList = await getDownloads();
    const updatedList = currentList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          progress: Math.min(100, progress),
          status: progress >= 100 ? 'completed' : status,
        };
      }
      return item;
    });
    await AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error('Error updating download progress:', err);
    return [];
  }
}

export async function removeDownloadItem(id: string): Promise<DownloadItem[]> {
  try {
    const currentList = await getDownloads();
    const updatedList = currentList.filter((i) => i.id !== id);
    await AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error('Error removing download item:', err);
    return [];
  }
}

export async function isDownloaded(id: string): Promise<boolean> {
  try {
    const currentList = await getDownloads();
    return currentList.some((i) => i.id === id);
  } catch (err) {
    return false;
  }
}
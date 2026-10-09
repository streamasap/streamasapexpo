import AsyncStorage from '@react-native-async-storage/async-storage';

export const MY_LIST_STORAGE_KEY = 'STREAMASAP_MY_LIST';

export interface MyListItem {
  id: string;
  tmdbId?: number;
  imdbId?: string;
  imdb_id?: string;
  title?: string;
  name?: string;
  year?: number | string;
  genre?: string;
  durationOrSeasons?: string;
  backdrop?: string;
  thumbnail?: string;
  overview?: string;
  score?: number;
  subjectType?: number;
}

export async function getMyList(): Promise<MyListItem[]> {
  try {
    const raw = await AsyncStorage.getItem(MY_LIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error fetching My List from AsyncStorage:', err);
    return [];
  }
}

export async function toggleMyListItem(item: MyListItem): Promise<boolean> {
  try {
    const currentList = await getMyList();
    const existingIndex = currentList.findIndex((i) => i.id === item.id);

    let updatedList: MyListItem[];
    let isAdded = false;

    if (existingIndex >= 0) {
      // Item exists, remove it
      updatedList = currentList.filter((i) => i.id !== item.id);
      isAdded = false;
    } else {
      // Add new item to top of list
      updatedList = [item, ...currentList];
      isAdded = true;
    }

    await AsyncStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(updatedList));
    return isAdded;
  } catch (err) {
    console.error('Error toggling My List item:', err);
    return false;
  }
}

export async function removeMyListItem(id: string): Promise<MyListItem[]> {
  try {
    const currentList = await getMyList();
    const updatedList = currentList.filter((i) => i.id !== id);
    await AsyncStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error('Error removing item from My List:', err);
    return [];
  }
}

export async function isInMyList(id: string): Promise<boolean> {
  try {
    const currentList = await getMyList();
    return currentList.some((i) => i.id === id);
  } catch (err) {
    return false;
  }
}
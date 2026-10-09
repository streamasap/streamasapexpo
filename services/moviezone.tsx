// services/moviezone.tsx
import { API_BASE_URL } from '../context/Api';

export interface TrendingMovieItem {
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

export async function fetchTrendingCatalog(): Promise<TrendingMovieItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/home`);
    const payload = await response.json();

    if (response.ok && payload.success && payload.data?.trending) {
      return payload.data.trending;
    }

    console.warn('Failed to fetch trending movies:', payload.message);
    return [];
  } catch (error) {
    console.error('Network error fetching trending catalog:', error);
    return [];
  }
}
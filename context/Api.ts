// context/api.ts
import Constants from 'expo-constants';

const rawApiUrl = Constants.expoConfig?.extra?.apiUrl;
export const ENVIRONMENT = Constants.expoConfig?.extra?.environment || 'development';

export const API_BASE_URL = rawApiUrl ? `${rawApiUrl}/api` : 'http://localhost:4000/api';

console.log(`[${ENVIRONMENT.toUpperCase()}] API Base URL:`, API_BASE_URL); 
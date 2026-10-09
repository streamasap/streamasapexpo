// app/(personalized)/_layout.tsx
import { Stack } from 'expo-router';

export default function PersonalizedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D12' },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="whosWatching" />
    </Stack>
  );
} 
// app/(onboard)/_layout.tsx
import { Stack } from 'expo-router';

export default function OnboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' },
        animation: 'fade',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="slides" />
    </Stack>
  );
}
 
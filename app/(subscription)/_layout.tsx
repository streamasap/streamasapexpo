// app/(subscription)/_layout.tsx
import { Stack } from 'expo-router';

export default function SubscriptionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D12' },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="payMethod" />
      <Stack.Screen name="cardDetails" />
      <Stack.Screen name="bankTransfer" />
    </Stack>
  );
}
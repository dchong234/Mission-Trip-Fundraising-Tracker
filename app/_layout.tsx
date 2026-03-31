import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../lib/context';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="details" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transaction" />
        <Stack.Screen name="giftlist" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="goaltracking" />
        <Stack.Screen name="paymentmethods" />
        <Stack.Screen name="share" />
        <Stack.Screen
          name="add-donation"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </AppProvider>
  );
}

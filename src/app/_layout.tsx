import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider, useStore } from '../store';
import { colors } from '../theme';

function Root() {
  const { ready } = useStore();
  if (!ready) return null;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'slide_from_right' }}>
      <Stack.Screen name="animo" options={{ animation: 'fade' }} />
      <Stack.Screen name="ejercicio/[id]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      <Stack.Screen name="terminado/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="autoevaluacion" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="fin" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}

export default function Layout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Root />
    </StoreProvider>
  );
}

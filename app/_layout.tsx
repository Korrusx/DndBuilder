import { GolosText_400Regular, GolosText_500Medium, GolosText_600SemiBold } from '@expo-google-fonts/golos-text';
import { Unbounded_600SemiBold, Unbounded_700Bold } from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { colors, fonts } from '@/shared/config/theme';
import { USER_DB_NAME } from '@/shared/db/config';
import { initUserDb } from '@/shared/db/db';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Unbounded_600SemiBold,
    Unbounded_700Bold,
    GolosText_400Regular,
    GolosText_500Medium,
    GolosText_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SQLiteProvider databaseName={USER_DB_NAME} onInit={initUserDb}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.display },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Мои персонажи' }} />
        <Stack.Screen name="create" options={{ headerShown: false }} />
        <Stack.Screen name="character/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ title: 'О приложении' }} />
      </Stack>
    </SQLiteProvider>
  );
}

import { GolosText_400Regular, GolosText_500Medium, GolosText_600SemiBold } from '@expo-google-fonts/golos-text';
import { Unbounded_600SemiBold, Unbounded_700Bold } from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import type { SQLiteDatabase } from 'expo-sqlite';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { colors, fonts } from '@/shared/config';
import { initUserDb, USER_DB_NAME } from '@/shared/db';
import { linkLegacyCampaigns } from '@/entities/campaign/api';
import { hombrewToEquipment, loadHombrewEquipment } from '@/features/homebrew-equipment';
import { injectHomebrew } from '@/shared/content';
import { LanguageGate, useTranslation } from '@/shared/i18n';

SplashScreen.preventAutoHideAsync();

async function initDb(db: SQLiteDatabase) {
  await initUserDb(db);
  await linkLegacyCampaigns(db);
  const homebrew = await loadHombrewEquipment(db);
  injectHomebrew(homebrew.map(hombrewToEquipment));
}

export default function RootLayout() {
  const { t } = useTranslation();
  const [loaded, error] = useFonts({
    Unbounded_600SemiBold,
    Unbounded_700Bold,
    GolosText_400Regular,
    GolosText_500Medium,
    GolosText_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SQLiteProvider databaseName={USER_DB_NAME} onInit={initDb}>
      <StatusBar style="light" />
      <LanguageGate>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: fonts.display },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" options={{ title: t('nav.characters') }} />
          <Stack.Screen name="create" options={{ headerShown: false }} />
          <Stack.Screen name="character/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="campaign/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ title: t('nav.about') }} />
          <Stack.Screen name="homebrew-equipment" options={{ title: t('nav.homebrew') }} />
        </Stack>
      </LanguageGate>
    </SQLiteProvider>
  );
}

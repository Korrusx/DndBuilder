import { router, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { AppText } from '@/components/AppText';
import { CharacterProvider, usePlay } from '@/components/play/CharacterContext';
import { colors, fonts, sizes } from '@/theme';

function PlayTabs() {
  const { character } = usePlay();
  return (
    <Tabs
      screenOptions={{
        title: character.name,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.display },
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="К списку персонажей"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={{ minWidth: sizes.touchMin, minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: 16 }}
          >
            <AppText style={{ fontSize: 28, color: colors.text }}>‹</AppText>
          </Pressable>
        ),
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.textMedium, fontSize: 13 },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Лист' }} />
      <Tabs.Screen name="skills" options={{ tabBarLabel: 'Навыки' }} />
      <Tabs.Screen name="combat" options={{ tabBarLabel: 'Бой' }} />
      <Tabs.Screen name="magic" options={{ tabBarLabel: 'Магия' }} />
      <Tabs.Screen name="items" options={{ tabBarLabel: 'Вещи' }} />
    </Tabs>
  );
}

export default function CharacterLayout() {
  return (
    <CharacterProvider>
      <PlayTabs />
    </CharacterProvider>
  );
}

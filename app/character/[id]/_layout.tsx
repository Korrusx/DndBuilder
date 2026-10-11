import { Tabs } from 'expo-router';

import { colors, fonts } from '@/theme';

export default function CharacterLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.display },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.textMedium, fontSize: 13 },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Лист' }} />
      <Tabs.Screen name="skills" options={{ title: 'Навыки' }} />
      <Tabs.Screen name="combat" options={{ title: 'Бой' }} />
      <Tabs.Screen name="magic" options={{ title: 'Магия' }} />
      <Tabs.Screen name="items" options={{ title: 'Вещи' }} />
    </Tabs>
  );
}

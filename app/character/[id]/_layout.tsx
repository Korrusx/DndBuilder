import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, type ColorValue } from 'react-native';

import { AppText } from '@/components/AppText';
import { CharacterProvider, usePlay } from '@/components/play/CharacterContext';
import { colors, fonts, sizes } from '@/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Иконка вкладки нижнего бара. */
const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => <MaterialCommunityIcons name={name} color={color as string} size={size} />;

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
        headerRight: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Изменить персонажа"
            onPress={() => router.navigate({ pathname: '/character/[id]/edit', params: { id: character.id } })}
            style={{ minWidth: sizes.touchMin, minHeight: sizes.touchMin, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}
          >
            <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.text} />
          </Pressable>
        ),
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
        tabBarLabelStyle: { fontFamily: fonts.textMedium, fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Лист', tabBarIcon: tabIcon('card-account-details-outline') }} />
      <Tabs.Screen name="skills" options={{ tabBarLabel: 'Навыки', tabBarIcon: tabIcon('dice-d20-outline') }} />
      <Tabs.Screen name="combat" options={{ tabBarLabel: 'Бой', tabBarIcon: tabIcon('sword-cross') }} />
      <Tabs.Screen name="magic" options={{ tabBarLabel: 'Магия', tabBarIcon: tabIcon('auto-fix') }} />
      <Tabs.Screen name="items" options={{ tabBarLabel: 'Вещи', tabBarIcon: tabIcon('bag-personal-outline') }} />
      <Tabs.Screen
        name="edit"
        options={{
          href: null,
          title: 'Изменить',
          tabBarStyle: { display: 'none' },
          headerRight: () => null,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Готово"
              onPress={() => router.navigate({ pathname: '/character/[id]', params: { id: character.id } })}
              style={{ minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: 16 }}
            >
              <AppText style={{ color: colors.accent, fontFamily: fonts.textBold }}>Готово</AppText>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="level-up"
        options={{
          href: null,
          title: 'Новый уровень',
          tabBarStyle: { display: 'none' },
          headerRight: () => null,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Отмена"
              onPress={() => router.navigate({ pathname: '/character/[id]', params: { id: character.id } })}
              style={{ minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: 16 }}
            >
              <AppText style={{ color: colors.accent, fontFamily: fonts.textBold }}>Отмена</AppText>
            </Pressable>
          ),
        }}
      />
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

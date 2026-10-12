import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { usePlay } from '@/entities/character/ui';
import { usePdfExport } from '@/features/export-pdf';
import { colors, fonts } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { tabIcon } from '../../lib/tabIcon';
import { styles } from './PlayTabs.styles';

export function PlayTabs() {
  const { character } = usePlay();
  const pdf = usePdfExport();
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        title: character.name,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.display },
        headerShadowVisible: false,
        headerRight: () => (
          <View style={styles.headerRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('tabs.pdf')}
              disabled={pdf.busy}
              onPress={() => pdf.run(character)}
              style={styles.headerButton}
            >
              {pdf.busy ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <MaterialCommunityIcons name="file-pdf-box" size={26} color={colors.text} />
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('tabs.editCharacter')}
              onPress={() => router.navigate({ pathname: '/character/[id]/edit', params: { id: character.id } })}
              style={styles.headerButton}
            >
              <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.text} />
            </Pressable>
          </View>
        ),
        headerLeft: () => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('tabs.back')}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={styles.backButton}
          >
            <AppText style={styles.backArrow}>‹</AppText>
          </Pressable>
        ),
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.textMedium, fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarLabel: t('tabs.sheet'), tabBarIcon: tabIcon('card-account-details-outline') }} />
      <Tabs.Screen name="skills" options={{ tabBarLabel: t('tabs.skills'), tabBarIcon: tabIcon('dice-d20-outline') }} />
      <Tabs.Screen name="combat" options={{ tabBarLabel: t('tabs.combat'), tabBarIcon: tabIcon('sword-cross') }} />
      <Tabs.Screen name="magic" options={{ tabBarLabel: t('tabs.magic'), tabBarIcon: tabIcon('auto-fix') }} />
      <Tabs.Screen name="items" options={{ tabBarLabel: t('tabs.items'), tabBarIcon: tabIcon('bag-personal-outline') }} />
      <Tabs.Screen
        name="edit"
        options={{
          href: null,
          title: t('nav.edit'),
          tabBarStyle: { display: 'none' },
          headerRight: () => null,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.done')}
              onPress={() => router.navigate({ pathname: '/character/[id]', params: { id: character.id } })}
              style={styles.textButton}
            >
              <AppText style={styles.linkLabel}>{t('common.done')}</AppText>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="level-up"
        options={{
          href: null,
          title: t('nav.levelUp'),
          tabBarStyle: { display: 'none' },
          headerRight: () => null,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              onPress={() => router.navigate({ pathname: '/character/[id]', params: { id: character.id } })}
              style={styles.textButton}
            >
              <AppText style={styles.linkLabel}>{t('common.cancel')}</AppText>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

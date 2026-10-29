import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { styles } from './CampaignHeader.styles';
import type { CampaignHeaderProps } from './CampaignHeader.types';

/** Шапка хроники: назад, название и «N сессий · мастер …», поиск по хронике. */
export function CampaignHeader({ title, subtitle, onTitlePress, query, onQueryChange }: CampaignHeaderProps) {
  const { t } = useTranslation();
  const searching = query !== null;
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('tabs.back')}
        onPress={() => (searching ? onQueryChange(null) : router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.icon}
      >
        <MaterialCommunityIcons name="chevron-left" size={30} color={colors.text} />
      </Pressable>
      {searching ? (
        <TextInput
          autoFocus
          value={query}
          onChangeText={onQueryChange}
          placeholder={t('chronicle.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          style={styles.search}
        />
      ) : (
        <Pressable accessibilityRole="button" onPress={onTitlePress} style={styles.titleWrap}>
          <AppText style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          <AppText style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </AppText>
        </Pressable>
      )}
      {searching ? null : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chronicle.search')}
          onPress={() => onQueryChange('')}
          style={styles.icon}
        >
          <MaterialCommunityIcons name="magnify" size={24} color={colors.text} />
        </Pressable>
      )}
    </View>
  );
}

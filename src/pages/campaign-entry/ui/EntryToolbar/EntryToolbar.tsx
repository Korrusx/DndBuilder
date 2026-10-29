import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { styles } from './EntryToolbar.styles';
import type { EntryToolbarProps } from './EntryToolbar.types';

/** Панель над клавиатурой: «@», фото, замок «тайная запись», состояние черновика. */
export function EntryToolbar({ onMention, onPhoto, secret, onToggleSecret, status }: EntryToolbarProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('chronicle.editor.mention')}
        onPress={onMention}
        style={styles.button}
      >
        <AppText style={styles.at}>@</AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('chronicle.editor.photo')}
        onPress={onPhoto}
        style={styles.button}
      >
        <MaterialCommunityIcons name="camera-outline" size={24} color={colors.textSecondary} />
      </Pressable>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={t('chronicle.editor.secret')}
        accessibilityState={{ checked: secret }}
        onPress={onToggleSecret}
        style={styles.button}
      >
        <MaterialCommunityIcons
          name={secret ? 'lock' : 'lock-open-variant-outline'}
          size={22}
          color={secret ? colors.accent : colors.textSecondary}
        />
      </Pressable>
      <AppText style={styles.status}>{status}</AppText>
    </View>
  );
}

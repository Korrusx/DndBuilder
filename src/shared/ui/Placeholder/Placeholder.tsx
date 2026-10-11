import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/config/theme';
import { AppText } from '../AppText/AppText';

/** Временная заглушка для экранов, которые ещё не сделаны. */
export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <View style={styles.card}>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="secondary">{note}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});

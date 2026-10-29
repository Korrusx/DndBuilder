import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  timeline: { gap: spacing.md },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    height: sizes.buttonPrimary,
    borderRadius: 18,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    elevation: 4,
  },
  fabText: { color: colors.onAccent, fontFamily: fonts.display, fontSize: 16 },
});

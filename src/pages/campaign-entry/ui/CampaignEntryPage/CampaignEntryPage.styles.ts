import { StyleSheet } from 'react-native';

import { colors, fonts, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm },
  icon: { width: sizes.touchMin, height: sizes.touchMin, alignItems: 'center', justifyContent: 'center' },
  titleWrap: { flex: 1 },
  title: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.text },
  subtitle: { fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary },
  done: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneDisabled: { opacity: 0.4 },
  doneText: { color: colors.onAccent, fontFamily: fonts.display, fontSize: 15 },
  tags: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  photo: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.surface2 },
  photoRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

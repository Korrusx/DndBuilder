import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: 18,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  hint: { paddingHorizontal: spacing.sm, paddingTop: spacing.xs },
  option: {
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 14,
  },
  optionSelected: { backgroundColor: colors.accentBg },
  radio: {
    width: 20,
    height: 20,
    marginTop: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  text: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.textBold, fontSize: 16, color: colors.text },
});

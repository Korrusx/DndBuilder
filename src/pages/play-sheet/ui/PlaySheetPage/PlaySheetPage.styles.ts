import { StyleSheet } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ability: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card - 4,
    overflow: 'hidden',
  },
  abilityTop: { alignItems: 'center', paddingVertical: spacing.sm },
  abilityAbbr: { fontFamily: fonts.display, fontSize: 13, color: colors.textSecondary },
  abilityMod: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.text },
  abilityScore: { fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary },
  save: { minHeight: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  saveText: { fontFamily: fonts.textMedium, fontSize: 13, color: colors.text },
  exhaustion: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fill: { flex: 1 },
});

import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  top: { alignItems: 'center', gap: 14, paddingTop: 4 },
  glow: {
    position: 'absolute',
    top: -60,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#241E13',
    opacity: 0.55,
  },
  who: { alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.display, fontSize: 22, color: colors.text, textAlign: 'center' },
  subtitle: { fontFamily: fonts.text, fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  backs: { flexDirection: 'row', gap: 10, paddingTop: 4 },
  back: { flex: 1, aspectRatio: 3 / 4 },
  dotHint: { fontFamily: fonts.text, fontSize: 12, color: '#6B737D', textAlign: 'center' },
  section: { gap: spacing.sm },
  caption: { fontFamily: fonts.text, fontSize: 12, letterSpacing: 0.7, color: colors.textSecondary },
  classes: { flexDirection: 'row', gap: spacing.sm },
  classButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
  },
  classOn: { borderWidth: 1.5, borderColor: colors.accent, backgroundColor: colors.accentBg },
  classTitle: { fontFamily: fonts.textBold, fontSize: 15, color: colors.text },
  classSub: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
  classSubOn: { color: '#C9BFA9' },
  locked: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
});

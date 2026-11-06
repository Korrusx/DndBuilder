import { StyleSheet } from 'react-native';

import { colors, fonts, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1.5, padding: 18, gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  kicker: { fontFamily: fonts.text, fontSize: 11, letterSpacing: 0.7 },
  kickerPill: { height: 24, borderRadius: 12, paddingHorizontal: 10, justifyContent: 'center' },
  fill: { flex: 1 },
  status: { fontFamily: fonts.text, fontSize: 12 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30 },
  upgraded: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stamp: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    transform: [{ rotate: '-4deg' }],
  },
  stampText: { fontFamily: fonts.textBold, fontSize: 11, letterSpacing: 0.6 },
  was: { fontFamily: fonts.text, fontSize: 13, color: colors.textSecondary, textDecorationLine: 'line-through' },
  body: { fontFamily: fonts.text, fontSize: 15, lineHeight: 22, color: '#DCD5C8' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { minHeight: 28, borderRadius: 14, paddingHorizontal: 10, justifyContent: 'center' },
  tagText: { fontFamily: fonts.text, fontSize: 12 },
  choose: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chooseText: { fontFamily: fonts.display, fontSize: 14, color: colors.onAccent },
  keep: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  keepText: { fontFamily: fonts.textBold, fontSize: 14, color: colors.textSecondary },
  note: {
    alignSelf: 'flex-start',
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: colors.surface2,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  noteText: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
});

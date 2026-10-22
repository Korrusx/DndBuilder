import { StyleSheet } from 'react-native';

import { colors, fonts, radius, sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  segmentedItem: {
    flex: 1,
    minHeight: sizes.touchMin,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  segmentedLabel: { fontFamily: fonts.textBold, fontSize: 13, color: colors.text, textAlign: 'center' },
  segmentedItemOn: { backgroundColor: colors.accent },
  segmentedLabelOn: { color: colors.onAccent },
});

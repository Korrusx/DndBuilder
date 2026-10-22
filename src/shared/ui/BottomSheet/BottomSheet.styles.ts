import { StyleSheet } from 'react-native';

import { colors, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
});

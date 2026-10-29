import { StyleSheet } from 'react-native';

import { sizes, spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  photo: { height: '100%' },
  close: {
    position: 'absolute',
    right: spacing.md,
    width: sizes.touchMin,
    height: sizes.touchMin,
    borderRadius: sizes.touchMin / 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

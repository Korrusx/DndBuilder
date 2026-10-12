import { StyleSheet } from 'react-native';

import { spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: spacing.xs },
  // Сегмент тонкий, а нажимать его пальцем: зона нажатия выше самой полоски.
  segmentHit: { flex: 1, paddingVertical: spacing.sm },
  segment: { height: 6, borderRadius: 3 },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  fill: { flex: 1 },
});

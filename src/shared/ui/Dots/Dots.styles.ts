import { StyleSheet } from 'react-native';

import { spacing } from '@/shared/config';

export const styles = StyleSheet.create({
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
});

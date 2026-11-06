import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrap: { minHeight: 180 },
  face: { backfaceVisibility: 'hidden' },
  back: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backfaceVisibility: 'hidden' },
  fill: { flex: 1 },
});

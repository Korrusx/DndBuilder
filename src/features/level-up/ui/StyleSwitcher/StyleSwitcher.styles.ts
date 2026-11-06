import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

export const SWATCH = 12;

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  button: { height: 36, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontFamily: fonts.text, fontSize: 13 },
  swatch: { width: SWATCH, height: SWATCH },
});

import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

export const styles = StyleSheet.create({
  layer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  glow: { position: 'absolute' },
  digit: { fontFamily: fonts.displayBold, textAlign: 'center' },
  caption: { position: 'absolute', fontFamily: fonts.text, color: '#C9A46A' },
});

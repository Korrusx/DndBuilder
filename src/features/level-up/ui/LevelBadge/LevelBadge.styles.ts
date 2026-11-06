import { StyleSheet } from 'react-native';

import { fonts } from '@/shared/config';

import { BADGE } from '../../config/constants';

export const styles = StyleSheet.create({
  badge: { width: BADGE.size, height: BADGE.size, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', top: -BADGE.glow, left: -BADGE.glow },
  svg: { position: 'absolute', top: 0, left: 0 },
  digit: { fontFamily: fonts.displayBold, fontSize: BADGE.digit, lineHeight: 22 },
});

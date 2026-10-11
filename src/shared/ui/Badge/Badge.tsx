import { colors, fonts } from '@/shared/config';
import { View } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './Badge.styles';
import type { BadgeProps } from './Badge.types';

export function Badge({ label }: BadgeProps) {
  return (
    <View style={styles.badge}>
      <AppText style={{ fontFamily: fonts.textBold, fontSize: 11, color: colors.info }}>{label}</AppText>
    </View>
  );
}

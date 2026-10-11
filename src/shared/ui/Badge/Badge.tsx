import { colors, fonts } from '@/shared/config';
import { View } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './Badge.styles';

export function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <AppText style={{ fontFamily: fonts.textBold, fontSize: 11, color: colors.info }}>{label}</AppText>
    </View>
  );
}

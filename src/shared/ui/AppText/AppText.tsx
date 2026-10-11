import { StyleSheet, Text, TextProps } from 'react-native';

import { colors, fonts } from '@/shared/config/theme';

type Variant = 'title' | 'heading' | 'body' | 'secondary' | 'number';

type Props = TextProps & { variant?: Variant };

export function AppText({ variant = 'body', style, ...rest }: Props) {
  return <Text style={[styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.text },
  heading: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  body: { fontFamily: fonts.text, fontSize: 16, lineHeight: 22, color: colors.text },
  secondary: { fontFamily: fonts.text, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  number: { fontFamily: fonts.displayBold, fontSize: 32, color: colors.text },
});

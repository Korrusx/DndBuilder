import { Text } from 'react-native';

import { styles } from './AppText.styles';
import type { AppTextProps } from './AppText.types';

export function AppText({ variant = 'body', style, ...rest }: AppTextProps) {
  return <Text style={[styles[variant], style]} {...rest} />;
}

import { TextProps } from 'react-native';

export type Variant = 'title' | 'heading' | 'body' | 'secondary' | 'number';

export type AppTextProps = TextProps & { variant?: Variant };

import type { AppTextProps } from '../AppText/AppText.types';

export type LinkedTextProps = Omit<AppTextProps, 'children'> & { text: string };

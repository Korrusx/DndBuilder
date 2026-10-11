import type { LocalizedText } from '@/shared/content/types';
import { AppText } from '../AppText/AppText';

export type LTextProps = Omit<React.ComponentProps<typeof AppText>, 'children'> & { text: LocalizedText | undefined };

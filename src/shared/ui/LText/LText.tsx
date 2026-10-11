import { colors } from '@/shared/config/theme';
import { tr } from '@/shared/content/content';
import type { LocalizedText } from '@/shared/content/types';
import { AppText } from '../AppText/AppText';

type Props = Omit<React.ComponentProps<typeof AppText>, 'children'> & { text: LocalizedText | undefined };

/** Текст из справочника. Если перевода нет — английский текст с пометкой «EN». */
export function LText({ text, ...rest }: Props) {
  const { text: value, translated } = tr(text);
  return (
    <AppText {...rest}>
      {value}
      {translated ? null : <AppText style={{ color: colors.textSecondary, fontSize: 11 }}> EN</AppText>}
    </AppText>
  );
}

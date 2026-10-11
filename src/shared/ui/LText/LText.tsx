import { colors } from '@/shared/config';
import { tr } from '@/shared/content';
import { AppText } from '../AppText/AppText';
import type { LTextProps } from './LText.types';

/** Текст из справочника. Если перевода нет — английский текст с пометкой «EN». */
export function LText({ text, ...rest }: LTextProps) {
  const { text: value, translated } = tr(text);
  return (
    <AppText {...rest}>
      {value}
      {translated ? null : <AppText style={{ color: colors.textSecondary, fontSize: 11 }}> EN</AppText>}
    </AppText>
  );
}

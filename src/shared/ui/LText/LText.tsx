import { tr } from '@/shared/content';
import { currentLanguage } from '@/shared/i18n/model';

import { AppText } from '../AppText/AppText';
import { styles } from './LText.styles';
import type { LTextProps } from './LText.types';

/** Текст из справочника. Если текста на текущем языке нет — текст на другом языке с пометкой («EN» / «RU»). */
export function LText({ text, ...rest }: LTextProps) {
  const { text: value, translated } = tr(text);
  return (
    <AppText {...rest}>
      {value}
      {translated ? null : <AppText style={styles.textTextSecondarySize11}>{currentLanguage() === 'en' ? ' RU' : ' EN'}</AppText>}
    </AppText>
  );
}

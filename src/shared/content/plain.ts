import { localizeText } from './content';
import type { LocalizedText } from './types';

/** Текст справочника без разметки **жирного**. */
export function plain(text: LocalizedText | undefined): string {
  return localizeText(text).text.replace(/\*\*/g, '').replace(/\*/g, '');
}

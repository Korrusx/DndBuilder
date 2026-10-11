import { tr } from './content';
import type { LocalizedText } from './types';

/** Текст справочника без разметки **жирного**. */
export function plain(text: LocalizedText | undefined): string {
  return tr(text).text.replace(/\*\*/g, '').replace(/\*/g, '');
}

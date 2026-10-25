import type { TextPart } from './types';

const URL_PATTERN = /https?:\/\/\S+/g;
// Точка или скобка в конце предложения — не часть адреса.
const TRAILING_PUNCTUATION = /[.,;:!?)»"']+$/;

/**
 * Делит текст на обычные куски и ссылки. В тексте ссылки после «/» стоит пробел нулевой ширины:
 * длинный адрес переносится по частям, а не обрезается на узком экране.
 */
export function splitLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0].replace(TRAILING_PUNCTUATION, '');
    const start = match.index;
    if (start > last) {
      parts.push({ text: text.slice(last, start) });
    }
    parts.push({ text: url.replace(/\//g, '/​'), url });
    last = start + url.length;
  }
  if (last < text.length) {
    parts.push({ text: text.slice(last) });
  }
  return parts;
}

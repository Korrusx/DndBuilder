// Сокращения, после которых точка не заканчивает предложение: «мод. ТЕЛ», «(см. …)», «т. е.», «e.g.».
const ABBREVIATIONS = /(?:^|[\s(])(?:мод|см|ур|т\.\s?е|т\.\s?п|т|е|п|напр|mod|e\.g|i\.e|etc|ft|lvl)$/i;

/** Первое предложение текста; если точки нет — весь текст. */
export function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const end = /[.!?](?=\s|$)/g;
  let match: RegExpExecArray | null;
  while ((match = end.exec(clean))) {
    if (!ABBREVIATIONS.test(clean.slice(0, match.index))) {
      return clean.slice(0, match.index + 1);
    }
  }
  return clean;
}

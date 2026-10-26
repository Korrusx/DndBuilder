import { byId, localizeText, plain } from '@/shared/content';
import { firstSentence } from '@/shared/lib/text';
import type { VariantOption } from '@/shared/ui';

/** Подклассы 1-го уровня (2014) для панели под плиткой: название и первое предложение описания. */
export function subclassOptions(ids: string[]): VariantOption[] {
  return ids.flatMap((id) => {
    const sub = byId.subclasses.get(id);
    if (!sub) {
      return [];
    }
    const summary = localizeText(sub.summary).text || firstSentence(plain(sub.description));
    return [{ id, name: localizeText(sub.name).text, description: summary }];
  });
}

import { t } from '@/shared/i18n';

import type { SourcedId } from '../model/types';

/** Подпись источника умения: «Класс», «Подкласс», «Вид», «Черта». */
export function featureSourceLabel(source: SourcedId['source']): string {
  return t(`featureSource.${source}`);
}

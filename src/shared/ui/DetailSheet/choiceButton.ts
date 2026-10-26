import { t } from '@/shared/i18n';

import type { DetailChoice } from './DetailSheet.types';

/** Большая кнопка внизу шторки: «Выбрать», «Убрать из выбранных» или недоступно с причиной. */
export function choiceButton(id: string, choice: DetailChoice) {
  if (choice.isSelected(id)) {
    return { title: t('detailSheet.remove'), variant: 'secondary' as const, disabled: false };
  }
  const reason = choice.reason?.(id);
  if (reason) {
    return { title: t('detailSheet.select'), variant: 'primary' as const, disabled: true, note: reason };
  }
  // Выбор одного варианта заменяет прежний, поэтому лимит мешает только при выборе нескольких.
  if (choice.max > 1 && choice.picked >= choice.max) {
    return {
      title: t('detailSheet.select'),
      variant: 'primary' as const,
      disabled: true,
      note: t('detailSheet.limit', { picked: choice.picked, max: choice.max }),
    };
  }
  return { title: t('detailSheet.select'), variant: 'primary' as const, disabled: false };
}

import type { PickerFieldProps } from '@/shared/ui';

import type { Character } from '../../model/types';

export type SpellPickerFieldProps = Omit<PickerFieldProps, 'items' | 'filters' | 'detail'> & {
  /** id заклинаний, из которых выбирают. */
  options: string[];
  /** Для урона заговоров по уровню персонажа. */
  character?: Character;
  /** Уже выбранные в другом месте — выбрать нельзя (с причиной). */
  blocked?: Map<string, string>;
};

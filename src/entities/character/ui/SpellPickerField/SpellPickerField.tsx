import { useMemo } from 'react';

import { byId, content } from '@/shared/content';
import { PickerField } from '@/shared/ui';

import { spellDetail } from '../../lib/spellDetail';
import { spellPickFilters, spellPickItems } from '../../lib/spellPick';
import type { SpellPickerFieldProps } from './SpellPickerField.types';

/** Раздел выбора заклинаний: кнопка открывает полноэкранный список с поиском, фильтрами и описаниями. */
export function SpellPickerField({ options, character, blocked, ...field }: SpellPickerFieldProps) {
  const items = useMemo(() => spellPickItems(options, content, character, blocked), [options, character, blocked]);
  const filters = useMemo(() => spellPickFilters(items), [items]);
  const detail = (id: string) => {
    const spell = byId.spells.get(id);
    return spell ? spellDetail(spell, content, character) : null;
  };
  return <PickerField {...field} items={items} filters={filters} detail={detail} />;
}

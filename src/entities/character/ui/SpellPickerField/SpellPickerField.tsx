import { useMemo } from 'react';

import { byId, content } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { PickerField } from '@/shared/ui';

import { spellDetail } from '../../lib/spellDetail';
import { spellPickFilters, spellPickItems } from '../../lib/spellPick';
import { totalLevel } from '../../model/character';
import type { SpellPickerFieldProps } from './SpellPickerField.types';

/** Раздел выбора заклинаний: кнопка открывает полноэкранный список с поиском, фильтрами и описаниями. */
export function SpellPickerField({ options, character, blocked, ...field }: SpellPickerFieldProps) {
  // Список пересобирается, только когда меняются сами варианты, уровень (урон заговоров), занятые
  // заклинания, язык или редакция — а не при каждом выборе: экраны передают новые массивы и персонажа
  // на каждой отрисовке.
  const { i18n } = useTranslation();
  const language = i18n.language;
  const edition = content.edition;
  const level = character ? totalLevel(character.classes) : 1;
  const optionsKey = options.join(',');
  const blockedKey = JSON.stringify([...(blocked ?? [])]);
  const items = useMemo(
    () =>
      spellPickItems(
        optionsKey ? optionsKey.split(',') : [],
        content,
        level,
        new Map(JSON.parse(blockedKey) as [string, string][]),
      ),
    // language и edition — только ключи пересборки: тексты и справочник берутся внутри.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [optionsKey, level, blockedKey, language, edition],
  );
  const filters = useMemo(() => spellPickFilters(items), [items]);
  const detail = (id: string) => {
    const spell = byId.spells.get(id);
    return spell ? spellDetail(spell, content, character) : null;
  };
  return <PickerField {...field} items={items} filters={filters} detail={detail} />;
}

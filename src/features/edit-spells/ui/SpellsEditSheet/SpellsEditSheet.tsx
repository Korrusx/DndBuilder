import { useState } from 'react';

import {
  classSpellLists,
  hasSpellbook,
  preparableSpells,
  setClassSpellLists,
  setSpellbook,
  spellbook,
  spellbookMinimum,
  spellbookOptions,
  spellLimits,
  spellOptions,
} from '@/entities/character';
import { SpellPickerField } from '@/entities/character/ui';
import { byId, content } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, pickerSequence } from '@/shared/ui';

import { CANTRIPS, PREPARED, SPELLBOOK } from '../../config/constants';
import type { SpellsEditSheetProps } from './SpellsEditSheet.types';

export function SpellsEditSheet({ visible, character, classId, onChange, onClose }: SpellsEditSheetProps) {
  const { t } = useTranslation();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const limits = spellLimits(character, content, classId);
  if (!limits) {
    return null;
  }
  const { cantrips, preparedSpells } = classSpellLists(character, content, limits.classId);
  const setLists = (patch: Parameters<typeof setClassSpellLists>[3]) =>
    onChange((d) => setClassSpellLists(d, content, limits.classId, patch));
  const circles = Array.from({ length: limits.maxSpellLevel }, (_, i) => i + 1);
  const book = spellbook(character);
  const withBook = limits.classId === 'wizard' && hasSpellbook(character);

  // Все круги в одном списке (фильтр по кругу — на экране выбора); выбранное вне списка не трогаем.
  const bookOptions = circles.flatMap((circle) => spellbookOptions(character, content, circle));
  const inBook = new Set(bookOptions);
  const preparedOptions = circles.flatMap((circle) => preparableSpells(character, content, limits.classId, circle));
  const inPrepared = new Set(preparedOptions);
  const preparedHere = preparedSpells.filter((id) => inPrepared.has(id));
  const preparedElsewhere = preparedSpells.length - preparedHere.length;

  const step = pickerSequence(
    [...(limits.cantrips > 0 ? [CANTRIPS] : []), ...(withBook ? [SPELLBOOK] : []), PREPARED],
    openKey,
    setOpenKey,
  );

  return (
    <BottomSheet visible={visible} title={t('spells.title')} onClose={onClose}>
      <AppText variant="secondary">{t('spells.editHint')}</AppText>
      {limits.cantrips > 0 ? (
        <SpellPickerField
          {...step(CANTRIPS)}
          title={t('spells.cantrips')}
          buttonLabel={t('picker.chooseCantrips')}
          options={spellOptions(limits.classId, 0, content)}
          selected={cantrips}
          max={limits.cantrips}
          character={character}
          onChange={(ids) => setLists({ cantrips: ids })}
        />
      ) : null}
      {withBook ? (
        <SpellPickerField
          {...step(SPELLBOOK)}
          title={t('spells.spellbook')}
          hint={t('spells.spellbookHint')}
          buttonLabel={t('picker.chooseSpells')}
          options={bookOptions}
          selected={book.filter((id) => inBook.has(id))}
          max={bookOptions.length}
          need={spellbookMinimum(character)}
          character={character}
          onChange={(ids) =>
            onChange((d) => setSpellbook(d, [...book.filter((id) => !inBook.has(id)), ...ids], content))
          }
        />
      ) : null}
      <SpellPickerField
        {...step(PREPARED)}
        title={
          byId.classes.get(limits.classId)?.spellcasting?.preparation === 'known'
            ? t('spells.known')
            : t('spells.prepared')
        }
        buttonLabel={t('picker.chooseSpells')}
        options={preparedOptions}
        selected={preparedHere}
        // Общий лимит: подготовленные вне списка (например, с прежних уровней другого класса) тоже считаются.
        max={Math.max(preparedHere.length, limits.prepared - preparedElsewhere)}
        need={limits.prepared}
        character={character}
        onChange={(ids) =>
          setLists({ preparedSpells: [...preparedSpells.filter((id) => !inPrepared.has(id)), ...ids] })
        }
      />
    </BottomSheet>
  );
}

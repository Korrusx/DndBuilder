import type { Character } from '@/entities/character';

export type SpellsEditSheetProps = {
  visible: boolean;
  character: Character;
  /** Изменения: заговоры, подготовленные, а у волшебника ещё и книга (в `choices`). */
  onChange: (patch: Pick<Character, 'cantrips' | 'preparedSpells'> & Partial<Pick<Character, 'choices'>>) => void;
  onClose: () => void;
};

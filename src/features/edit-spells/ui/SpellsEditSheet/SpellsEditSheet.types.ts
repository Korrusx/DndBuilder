import type { Character } from '@/entities/character';

export type SpellsEditSheetProps = {
  visible: boolean;
  character: Character;
  onChange: (patch: Pick<Character, 'cantrips' | 'preparedSpells'>) => void;
  onClose: () => void;
};

import type { Character } from '../../model/types';

export type CharacterCardProps = {
  character: Character;
  onPress: () => void;
  onLongPress: () => void;
  /** Режим выбора для массового удаления: undefined — выключен. */
  selected?: boolean;
  /** Сколько всего шагов в мастере создания — для подписи черновика «шаг N из M». */
  draftSteps: number;
};

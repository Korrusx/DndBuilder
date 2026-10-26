import type { OriginFeatSlot } from '@/entities/character';
import type { PickerStep } from '@/shared/ui';

export type MagicInitiateProps = {
  slot: OriginFeatSlot;
  fixedList?: string;
  setChoice: (key: string, ids: string[]) => void;
  /** Открыт ли экран выбора раздела и куда ведёт «Далее». */
  step: (key: string) => PickerStep;
};

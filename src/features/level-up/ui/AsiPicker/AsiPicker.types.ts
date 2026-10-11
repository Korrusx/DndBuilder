import type { AbilityId } from '@/shared/content';

export type AsiPickerProps = {
  increases: Partial<Record<AbilityId, number>>;
  scores: Record<AbilityId, number>;
  onChange: (inc: Partial<Record<AbilityId, number>>) => void;
};

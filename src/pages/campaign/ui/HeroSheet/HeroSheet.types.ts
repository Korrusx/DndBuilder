import type { ParticipantStatus } from '@/entities/campaign';

import type { Hero } from '../HeroChips/HeroChips.types';

export type HeroSheetProps = {
  /** Чей это лист; null — окно закрыто. */
  hero: Hero | null;
  onClose: () => void;
  onOpenSheet: (hero: Hero) => void;
  onToHall: (hero: Hero, status: Exclude<ParticipantStatus, 'active'>, epitaph: string) => void;
};

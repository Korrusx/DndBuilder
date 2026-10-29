import type { CampaignCharacter } from '@/entities/campaign';
import type { Character } from '@/entities/character';

export type Hero = { participant: CampaignCharacter; character: Character };

export type HeroChipsProps = {
  heroes: Hero[];
  hallCount: number;
  onHero: (hero: Hero) => void;
  onHall: () => void;
};

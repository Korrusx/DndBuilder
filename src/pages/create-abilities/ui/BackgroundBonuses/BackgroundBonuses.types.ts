import type { Character } from '@/entities/character';
import type { AbilityId } from '@/shared/content';

export type BackgroundBonusesProps = { character: Character; allowed: AbilityId[] };

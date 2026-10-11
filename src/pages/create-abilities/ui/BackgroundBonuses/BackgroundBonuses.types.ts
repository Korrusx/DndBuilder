import type { Character } from '@/entities/character';
import type { AbilityId } from '@/shared/content';

export type BackgroundBonusesProps = { c: Character; allowed: AbilityId[] };

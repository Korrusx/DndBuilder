import { ABILITY_IDS } from '@/entities/character/config/constants';
import type { AbilityId } from '@/shared/content/types';

export const MAX_LEVEL = 20;

/** Умения, дающие компетентность, и сколько навыков (по тексту SRD 5.2). */
export const EXPERTISE_GRANTS: Record<string, number> = {
  'rogue-expertise': 2,
  'bard-expertise': 2,
  'ranger-expertise': 2,
  'ranger-deft-explorer': 1,
  'wizard-scholar': 1,
};

/** Умения, дающие новые языки. */
export const LANGUAGE_GRANTS: Record<string, number> = { 'ranger-deft-explorer': 2 };

/** Умения, дающие владение навыками на выбор: из списка класса 1-го уровня или любыми. */
export const SKILL_GRANTS: Record<string, { choose: number; from: 'class' | 'any' }> = {
  'barbarian-primal-knowledge': { choose: 1, from: 'class' },
  'lore-bonus-proficiencies': { choose: 3, from: 'any' },
};

/**
 * Прибавки к характеристикам от черт, которые берут на уровне.
 * «Увеличение характеристик»: +2 к одной или +1 к двум. Остальные: +1 к одной из списка.
 * TODO: черта «Посвящённый в магию» на уровне пока не предлагается (нужен выбор заклинаний).
 */
export const FEAT_ABILITY: Record<string, { abilities: AbilityId[]; cap: number } | 'asi'> = {
  'ability-score-improvement': 'asi',
  grappler: { abilities: ['str', 'dex'], cap: 20 },
  'boon-of-combat-prowess': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-dimensional-travel': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-fate': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-irresistible-offense': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-spell-recall': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-the-night-spirit': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-truesight': { abilities: ABILITY_IDS, cap: 30 },
};

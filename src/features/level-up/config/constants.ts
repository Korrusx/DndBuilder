import type { PendingField } from '@/entities/character';
import { ABILITY_IDS } from '@/entities/character';
import type { AbilityId } from '@/shared/content';

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

/** Поля персонажа, которые меняют выборы уровня и хранятся в отложенном повышении. */
export const PENDING_FIELDS: PendingField[] = [
  'classes',
  'choices',
  'feats',
  'expertise',
  'languages',
  'weaponMasteries',
  'cantrips',
  'preparedSpells',
];

// ---------- Экран «Новое на N-м уровне» (design/level-up/deck-screen-spec.md) ----------

/** Больше стольких чипов — сворачиваем в «+N ещё» (раздел 6.7). */
export const CHIPS_VISIBLE_MAX = 6;
/** Сколько чипов видно в свёрнутом списке. */
export const CHIPS_SHOWN = 5;
/** Чипы 26–32 по высоте дотягиваются нажатием до 44 (раздел 10). */
export const CHIP_HIT_SLOP = { top: 9, bottom: 9, left: 4, right: 4 };
/** До стольких карт лента колоды делится на равные колонки, больше — прокручивается (раздел 4). */
export const DECK_TILES_FIT = 6;
/** Ширина плитки ленты, когда лента прокручивается. */
export const DECK_TILE_WIDTH = 52;
/** Описание длиннее — под ним «Подробнее» (до 4 строк на карте). */
export const CARD_BODY_LINES = 4;
/** Примерно столько символов помещается в 4 строки описания на карте; длиннее — «Подробнее». */
export const CARD_BODY_CHARS = 160;

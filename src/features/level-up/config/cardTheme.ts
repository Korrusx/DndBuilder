// Цвета типов карт (docs/features/level-up.md, раздел 4; макет design/level-up/source/LvlTypes.dc.html).
// Цвета текста — токены проекта и редкости предметов; фоны и рамки — тёмные оттенки того же цвета из макета.

import { colors, rarityColors } from '@/shared/config';

import type { LevelUpCardType } from '../model/types';

export type CardTheme = {
  /** Цвет метки, названия и акцентов. */
  accent: string;
  /** Светлый вариант для крупного названия. */
  title: string;
  background: string;
  border: string;
  /** Полосы рубашки. */
  stripes: [string, string];
  /** Иконка на рубашке. */
  icon: string;
  dashed?: boolean;
};

export const CARD_THEMES: Record<LevelUpCardType | 'summary', CardTheme> = {
  hp: {
    accent: colors.heal,
    title: colors.heal,
    background: colors.healBg,
    border: '#2C4A38',
    stripes: ['#13201A', '#16251E'],
    icon: '#4E9E73',
  },
  growth: {
    accent: colors.textSecondary,
    title: colors.text,
    background: colors.surface,
    border: colors.border,
    stripes: ['#171A1E', '#1B1F24'],
    icon: '#6B737D',
  },
  feature: {
    accent: colors.accent,
    title: colors.accent,
    background: '#1E1A12',
    border: '#5C4A22',
    stripes: ['#1F1A11', '#241E13'],
    icon: '#8A6A2E',
  },
  choice: {
    accent: colors.accent,
    title: colors.accent,
    background: colors.accentBg,
    border: colors.accent,
    stripes: ['#1F1A11', '#241E13'],
    icon: '#8A6A2E',
  },
  magic: {
    accent: rarityColors['very rare'],
    title: '#E2D0FF',
    background: '#1D1828',
    border: '#4A3A66',
    stripes: ['#1A1624', '#1F1A2B'],
    icon: '#8A6CC0',
  },
  species: {
    accent: rarityColors.rare,
    title: '#DCE8FF',
    background: '#161D28',
    border: '#33465F',
    stripes: ['#141A24', '#18202C'],
    icon: '#5E7FB0',
  },
  multiclass: {
    accent: colors.accent,
    title: colors.accent,
    background: '#15181C',
    border: '#8A6A2E',
    stripes: ['#15181C', '#191C21'],
    icon: '#8A6A2E',
    dashed: true,
  },
  capstone: {
    accent: rarityColors.legendary,
    title: rarityColors.legendary,
    background: '#2A1C12',
    border: rarityColors.legendary,
    stripes: ['#26190F', '#2C1E13'],
    icon: '#B8723E',
  },
  summary: {
    accent: colors.textSecondary,
    title: colors.text,
    background: '#15181C',
    border: '#3A4049',
    stripes: ['#15181C', '#15181C'],
    icon: '#6B737D',
    dashed: true,
  },
};

/** Иконки рубашек (имена @expo/vector-icons Feather). */
export const CARD_ICONS: Record<LevelUpCardType | 'summary', string> = {
  hp: 'heart',
  growth: 'trending-up',
  feature: 'star',
  choice: 'star',
  magic: 'zap',
  species: 'feather',
  multiclass: 'git-branch',
  capstone: 'award',
  summary: 'arrow-right',
};

/** Цвет кольца уровня: обычно акцент, у вершины — легендарный. */
export const RING_COLORS = {
  normal: colors.accent,
  capstone: rarityColors.legendary,
  track: colors.border,
  old: '#6B737D',
};

/** Цвета анимации У1 (раздел 8): обычный уровень — акцент, вершина — легендарный. */
export const INTRO_COLORS = {
  normal: { ring: colors.accent, spark: '#FFE2A8', glow: '242,177,74' },
  capstone: { ring: rarityColors.legendary, spark: rarityColors.legendary, glow: '255,159,90' },
  /** Фон экрана: центр градиента, тёплая вспышка, край. */
  background: { center: '#241E13', warm: '#3A2E18', edge: colors.bg },
} as const;

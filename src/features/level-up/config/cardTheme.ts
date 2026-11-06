// Цвета кольца уровня и ритуала. Цвета карт колоды — config/deckColors.ts.

import { colors, rarityColors } from '@/shared/config';

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
  /** Фон ритуала: центр градиента, к 52 % — mid, к 85 % — край; тёплая вспышка на ударе. */
  background: { center: '#2B2416', mid: '#13110D', edge: '#0B0C0E', warm: '#3A2E18' },
} as const;

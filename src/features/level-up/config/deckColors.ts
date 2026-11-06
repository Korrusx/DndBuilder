// Цвета экрана «Новое на N-м уровне» (design/level-up/deck-screen-spec.md, раздел 2).
// Все цвета карт, ленты и нижнего блока — только отсюда; в компонентах цветов напрямую нет.

import type { LevelUpCardType } from '../model/types';

export type DeckColors = {
  bg: string;
  border: string;
  accent: string;
  title: string;
  stripeA: string;
  stripeB: string;
  dim: string;
  dashed?: boolean;
};

const FEATURE: DeckColors = {
  bg: '#1E1A12',
  border: '#5C4A22',
  accent: '#F2B14A',
  title: '#FFF4DE',
  stripeA: '#1F1A11',
  stripeB: '#241E13',
  dim: '#8A6A2E',
};

export const DECK_COLORS: Record<LevelUpCardType, DeckColors> = {
  hp: {
    bg: '#13261D',
    border: '#2C4A38',
    accent: '#7FE0A8',
    title: '#F1ECE2',
    stripeA: '#13201A',
    stripeB: '#16251E',
    dim: '#4E9E73',
  },
  growth: {
    bg: '#1A1D22',
    border: '#2C323B',
    accent: '#9AA3AE',
    title: '#F1ECE2',
    stripeA: '#17191D',
    stripeB: '#1C1F24',
    dim: '#4A525D',
  },
  feature: FEATURE,
  choice: FEATURE,
  magic: {
    bg: '#1D1828',
    border: '#4A3A66',
    accent: '#C9A0FF',
    title: '#E2D0FF',
    stripeA: '#1A1626',
    stripeB: '#201B30',
    dim: '#6B58A8',
  },
  species: {
    bg: '#161D28',
    border: '#33465F',
    accent: '#8FB8FF',
    title: '#DCE8FF',
    stripeA: '#141B26',
    stripeB: '#18212E',
    dim: '#4A6A94',
  },
  multiclass: { ...FEATURE, bg: '#15181C', border: '#8A6A2E', dashed: true },
  capstone: {
    bg: '#2A1C12',
    border: '#FF9F5A',
    accent: '#FF9F5A',
    title: '#FFE6D2',
    stripeA: '#2A1C12',
    stripeB: '#33221A',
    dim: '#A86A3A',
  },
};

/** Общие цвета экрана. */
export const DECK_UI = {
  screen: '#0F1114',
  text: '#F1ECE2',
  secondary: '#9AA3AE',
  muted: '#6B737D',
  dot: '#4A525D',
  accent: '#F2B14A',
  onAccent: '#1A1406',
  accentPlate: '#2B2416',
  heal: '#7FE0A8',
  hpNumbers: '#A8D9BC',
  body: '#DCD5C8',
  soft: '#C9C3B8',
  surface: '#1A1D22',
  surface2: '#232831',
  border: '#2C323B',
  growthList: '#15181C',
  shadow: 'rgba(0,0,0,0.4)',
  /** Выбор: чипы выбранного и «Изменить». */
  choiceChipBorder: '#5C4A22',
  choiceChipText: '#FFF4DE',
  /** Магия: разделитель, подписи разделов, чипы заклинаний. */
  magicDivider: '#2E2645',
  magicCaption: '#8A7DAA',
  magicNew: '#E2D0FF',
  magicGlow: 'rgba(201,160,255,0.5)',
  spellChip: '#2E2650',
  spellChipBorder: '#6B58A8',
  spellChipText: '#E2D0FF',
  spellCircleText: '#1D1828',
  alwaysChip: '#241E38',
  alwaysChipText: '#C9C3E0',
  capstoneGlow: '#FF9F5A',
  /** Заливка значка уровня в шапке колоды. */
  badgeFill: '#1E1A12',
} as const;

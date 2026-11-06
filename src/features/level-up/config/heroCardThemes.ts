// Стили карты героя. Все цвета карты — только отсюда:
// в компонентах карты нет ни одного цвета напрямую.

import type { HeroCardStyle } from '@/entities/character';
import { fonts } from '@/shared/config';

export type CardStyle = HeroCardStyle;

/** Порядок стилей: кнопки и свайп (влево — следующий). */
export const CARD_STYLES: CardStyle[] = ['amber', 'night', 'parchment'];

/** Классы, для которых по умолчанию «Ночь» (раздел 4.4). */
export const NIGHT_CLASSES = new Set(['wizard', 'warlock', 'sorcerer']);

export type GradientStop = [number, string];

export type HeroCardTheme = {
  /** Рамка-фольга: линейный градиент под углом (150°) или сплошной цвет. */
  frame: { angle: number; stops: GradientStop[] };
  shadow: string;
  /** Свечение вокруг карты (0 0 60); null — без свечения. */
  glow: string | null;
  /** Внутренняя часть: радиальный градиент с центром (50 %, 0 %). */
  innerBg: GradientStop[];
  rule: string;
  corner: string;
  divider: string;
  watermark: string;
  /** Кольцо портрета: коническая заливка от угла 210°. */
  ring: { startAngle: number; colors: string[] };
  /** Лицо портрета: радиальный градиент с центром (40 %, 35 %). */
  face: GradientStop[];
  faceText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  text: string;
  sub: string;
  accentLabel: string;
  good: string;
  /** Нет изменения в медальоне («—»). */
  none: string;
  statBg: string;
  statBorder: string;
  newBg: string;
  newBorder: string;
  nextText: string;
  foot: string;
  /** Цвет блика, «r,g,b». */
  sheen: string;
  /** Белая середина блика. */
  sheenCore: string;
  spark: [string, string];
  /** Фон экрана: радиальный градиент, стопы 0 / 48 / 80 %. */
  screenBg: GradientStop[];
  /** Кружок-образец на кнопке стиля (линейный 135°). */
  swatch: [string, string];
  nameFont: string;
  nameSize: number;
  bodyFont: string;
  numFont: string;
  /** Шрифт цифр в медальонах (у Alegreya SC нет веса 600 — берётся 700). */
  numFontStat: string;
};

const solid = (color: string): GradientStop[] => [
  [0, color],
  [1, color],
];

export const HERO_CARD_THEMES: Record<CardStyle, HeroCardTheme> = {
  amber: {
    frame: {
      angle: 150,
      stops: [
        [0, '#FFD58A'],
        [0.3, '#8A6A2E'],
        [0.55, '#3A2E18'],
        [0.8, '#C9933A'],
        [1, '#FFE2A8'],
      ],
    },
    shadow: 'rgba(0,0,0,0.6)',
    glow: 'rgba(242,177,74,0.18)',
    innerBg: [
      [0, '#3A2E18'],
      [0.55, '#1C1812'],
      [1, '#141210'],
    ],
    rule: 'rgba(242,177,74,0.28)',
    corner: '#F2B14A',
    divider: '#8A6A2E',
    watermark: 'rgba(242,177,74,0.06)',
    ring: { startAngle: 210, colors: ['#FFE2A8', '#F2B14A', '#8A6A2E', '#F2B14A', '#FFE2A8'] },
    face: [
      [0, '#4A3A1E'],
      [0.7, '#241D12'],
    ],
    faceText: '#F2B14A',
    badgeBg: '#F2B14A',
    badgeText: '#1A1406',
    badgeBorder: '#1C1812',
    text: '#FFF4DE',
    sub: '#C9BFA9',
    accentLabel: '#C9A46A',
    good: '#7FE0A8',
    none: '#6B737D',
    statBg: 'rgba(15,17,20,0.55)',
    statBorder: '#3A3222',
    newBg: 'rgba(242,177,74,0.08)',
    newBorder: 'rgba(242,177,74,0.22)',
    nextText: '#9A8F78',
    foot: '#8A806C',
    sheen: '255,226,168',
    sheenCore: 'rgba(255,255,255,0.28)',
    spark: ['#FFE2A8', '#F2B14A'],
    screenBg: [
      [0, '#2B2416'],
      [0.48, '#14120E'],
      [0.8, '#0B0C0E'],
    ],
    swatch: ['#FFD58A', '#8A6A2E'],
    nameFont: fonts.display,
    nameSize: 24,
    bodyFont: fonts.text,
    numFont: fonts.displayBold,
    numFontStat: fonts.display,
  },
  night: {
    frame: {
      angle: 150,
      stops: [
        [0, '#E6D6FF'],
        [0.3, '#6B58A8'],
        [0.55, '#241D3D'],
        [0.8, '#8FB8FF'],
        [1, '#E6D6FF'],
      ],
    },
    shadow: 'rgba(0,0,0,0.6)',
    glow: 'rgba(201,160,255,0.18)',
    innerBg: [
      [0, '#2E2650'],
      [0.55, '#17142A'],
      [1, '#100E1C'],
    ],
    rule: 'rgba(201,160,255,0.28)',
    corner: '#C9A0FF',
    divider: '#4A3A80',
    watermark: 'rgba(201,160,255,0.07)',
    ring: { startAngle: 210, colors: ['#E6D6FF', '#C9A0FF', '#4A3A80', '#8FB8FF', '#E6D6FF'] },
    face: [
      [0, '#3E3470'],
      [0.7, '#1C1838'],
    ],
    faceText: '#DCC2FF',
    badgeBg: '#C9A0FF',
    badgeText: '#17142A',
    badgeBorder: '#17142A',
    text: '#F3EEFF',
    sub: '#A9A3C9',
    accentLabel: '#B49AE0',
    good: '#9FD8FF',
    none: '#6B737D',
    statBg: 'rgba(10,8,20,0.5)',
    statBorder: '#3A3360',
    newBg: 'rgba(201,160,255,0.08)',
    newBorder: 'rgba(201,160,255,0.24)',
    nextText: '#8A84A8',
    foot: '#7D7799',
    sheen: '230,214,255',
    sheenCore: 'rgba(255,255,255,0.28)',
    spark: ['#E6D6FF', '#C9A0FF'],
    screenBg: [
      [0, '#2A2346'],
      [0.48, '#110F1C'],
      [0.8, '#0A0A10'],
    ],
    swatch: ['#DCC2FF', '#3A2F5C'],
    nameFont: fonts.display,
    nameSize: 24,
    bodyFont: fonts.text,
    numFont: fonts.displayBold,
    numFontStat: fonts.display,
  },
  parchment: {
    frame: { angle: 150, stops: solid('#7B2D26') },
    shadow: 'rgba(0,0,0,0.6)',
    glow: null,
    innerBg: [
      [0, '#FBF5E6'],
      [0.6, '#F3EAD3'],
      [1, '#E9DCBE'],
    ],
    rule: 'rgba(123,45,38,0.45)',
    corner: '#7B2D26',
    divider: '#B8A27A',
    watermark: 'rgba(123,45,38,0.07)',
    ring: { startAngle: 210, colors: ['#7B2D26', '#7B2D26'] },
    face: [
      [0, '#FBF5E6'],
      [0.7, '#E9DCBE'],
    ],
    faceText: '#7B2D26',
    badgeBg: '#7B2D26',
    badgeText: '#F3EAD3',
    badgeBorder: '#F3EAD3',
    text: '#1B2A4A',
    sub: '#5A5246',
    accentLabel: '#7B2D26',
    good: '#2E6B47',
    none: '#6B737D',
    statBg: 'rgba(123,45,38,0.05)',
    statBorder: '#D9C9A6',
    newBg: 'rgba(27,42,74,0.05)',
    newBorder: '#D9C9A6',
    nextText: '#7A6E5A',
    foot: '#7A6E5A',
    sheen: '255,255,255',
    sheenCore: 'rgba(255,255,255,0.28)',
    spark: ['#F3EAD3', '#C9933A'],
    screenBg: [
      [0, '#3A2418'],
      [0.48, '#16110E'],
      [0.8, '#0B0C0E'],
    ],
    swatch: ['#F3EAD3', '#7B2D26'],
    nameFont: fonts.readingTitle,
    nameSize: 26,
    bodyFont: fonts.condensed,
    numFont: fonts.readingTitle,
    numFontStat: fonts.readingTitle,
  },
};

/** Цвета самого экрана итога (одинаковые для всех стилей, раздел 1 и 4.1). */
export const DONE_SCREEN = {
  title: '#F1ECE2',
  share: { background: '#F2B14A', text: '#1A1406' },
  toSheet: { background: 'rgba(26,29,34,0.8)', border: '#3A3222', text: '#F1ECE2' },
  chronicle: '#7FE0A8',
  styleOn: { border: '#F2B14A', background: '#2B2416', text: '#F2B14A' },
  styleOff: { border: '#2C323B', background: '#1A1D22', text: '#C9C3B8' },
} as const;

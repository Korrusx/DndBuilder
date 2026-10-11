// Дизайн-токены приложения. Значения взяты из CLAUDE.md (раздел «Экраны»).

export const colors = {
  bg: '#0F1114',
  surface: '#1A1D22',
  surface2: '#232831',
  border: '#2C323B',

  text: '#F1ECE2',
  textSecondary: '#9AA3AE',

  accent: '#F2B14A',
  onAccent: '#1A1406',
  accentBg: '#2B2416',

  damage: '#FF8A7A',
  damageBg: '#2A1715',
  heal: '#7FE0A8',
  healBg: '#13261D',
  info: '#C6D4E2',
  infoBg: '#172029',
} as const;

// Имена шрифтов совпадают с ключами, под которыми они загружаются в app/_layout.tsx.
export const fonts = {
  display: 'Unbounded_600SemiBold',
  displayBold: 'Unbounded_700Bold',
  text: 'GolosText_400Regular',
  textMedium: 'GolosText_500Medium',
  textBold: 'GolosText_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  button: 16,
  card: 20,
  chip: 999,
} as const;

export const sizes = {
  touchMin: 44,
  buttonPrimary: 56,
} as const;

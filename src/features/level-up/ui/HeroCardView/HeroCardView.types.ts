import type { SharedValue } from 'react-native-reanimated';

import type { HeroCardTheme } from '../../config/heroCardThemes';
import type { CardStat } from '../../lib/heroCard';

export type HeroCardSize = 'full' | 'compact';

/** Анимации карты, которые ведёт экран (блик, угол фольги). Без них карта в покое. */
export type HeroCardMotion = {
  /** Положение блика 0…1: 0 — сдвиг −160 % ширины полосы, 1 — +260 %. */
  sheenProgress?: SharedValue<number>;
  sheenOpacity?: SharedValue<number>;
  /** Угол градиента фольги, градусы (150 ± 15 при наклоне). */
  frameAngle?: SharedValue<number>;
};

export type HeroCardViewProps = {
  theme: HeroCardTheme;
  size: HeroCardSize;
  /** Ширина карты: на экране — ширина минус поля, но не больше 350; в сторис — 300. */
  width: number;
  name: string;
  letter: string;
  portrait?: string;
  subtitle: string;
  level: number;
  stats: CardStat[];
  unlocked: string;
  /** «Дальше, на 7-м: …»; у компактной карты не показывается. */
  next?: string | null;
  /** «Кампания · сессия · дата»; у компактной карты подвала нет. */
  footer?: string;
  accessibilityLabel: string;
  motion?: HeroCardMotion;
};

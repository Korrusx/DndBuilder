export type HeroCardRow = { label: string; before?: string; after: string };

export type HeroCardProps = {
  name: string;
  letter: string;
  /** Путь к портрету (если есть). */
  portrait?: string;
  /** «Полурослик · Плут · Вор». */
  subtitle: string;
  level: number;
  rows: HeroCardRow[];
  /** «Тени Солёной Гавани · сессия 12»; нет кампании — строки нет. */
  campaignLine?: string;
  /** Вершина: оранжевая рамка и «Легенда». */
  capstone?: boolean;
  /** Карточка для картинки «Поделиться» (1080×1350 при захвате). */
  share?: boolean;
};

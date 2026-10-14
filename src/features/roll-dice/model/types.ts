import type { D20Mode, D20Roll } from '@/shared/lib/dice';

export type RollPart = { label: string; value: number };

export type D20Request = {
  title: string;
  parts: RollPart[];
  mode?: D20Mode;
  /** Уже сделанный бросок (спасбросок от смерти): только показать, без переброса. */
  roll?: D20Roll;
};

export type DamageRequest = {
  title: string;
  dice: string;
  bonus: number;
  damageType?: string;
  /** «Сражение большим оружием»: 1 и 2 на костях считаются за это число. */
  minDie?: number;
  /** Варианты костей на выбор (урон заклинания по кругу ячейки); `dice` — первый из них. */
  variants?: { label: string; dice: string; bonus?: number }[];
  /** Лечение и временные хиты: без критического. */
  noCritical?: boolean;
  /** Пояснение под костями. */
  note?: string;
};

/** Как показывать бросок к20: 3D-стол или простые плашки с числами. */
export type DiceStyle = '3d' | 'simple';
export type DiceSkin = 'amber' | 'obsidian' | 'bone';
export type DiceTableKind = 'felt' | 'stone';
export type DiceSettings = { style: DiceStyle; animation: boolean; skin: DiceSkin; table: DiceTableKind };

/** Что бросить на 3D-столе: числа уже выпали, сцена только кладёт кости нужной гранью вверх. */
export type TableRoll = {
  /** Меняется с каждым новым броском. */
  id: number;
  dice: number[];
  /** Какая кость: 4, 6, 8, 10, 12 или 20. */
  sides: number;
  /** Кость, которая идёт в зачёт (к20 с преимуществом или помехой); остальные притушены. */
  keep?: number;
};

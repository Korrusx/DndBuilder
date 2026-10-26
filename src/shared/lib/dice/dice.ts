import { t } from '@/shared/i18n';

import type { D20Mode, D20Roll, DiceExpr } from './types';

// Кости: разбор записи «2d6», показ на текущем языке («2к6» / «2d6»), броски.

/** «2d6» → 2 кости по 6 граней. Число без кости (урон духовой трубки «1») — фиксированное значение: грани = 1. */
export function parseDice(expr: string): DiceExpr {
  const flat = /^(\d+)$/.exec(expr.trim());
  if (flat) {
    return { count: Number(flat[1]), sides: 1 };
  }
  const m = /^(\d+)\s*[dк](\d+)$/i.exec(expr.trim());
  if (!m) {
    throw new Error(`Не понимаю запись костей: ${expr}`);
  }
  return { count: Number(m[1]), sides: Number(m[2]) };
}

/** Кость без количества: 8 → «к8» / «d8». */
export function formatDie(sides: number): string {
  return `${t('dice.d')}${sides}`;
}

/** «1d6» → «1к6» (по-английски «1d6»); фиксированный урон «1» — «1». */
export function formatDice(expr: string | DiceExpr): string {
  const { count, sides } = typeof expr === 'string' ? parseDice(expr) : expr;
  return sides === 1 ? `${count}` : `${count}${formatDie(sides)}`;
}

/** Расстояние в футах: «30 фт» / «30 ft». */
export function formatFeet(value: number): string {
  return t('units.ft', { value });
}

/** Модификатор со знаком: +5, −1, +0. */
export function formatModifier(value: number): string {
  return value < 0 ? `−${Math.abs(value)}` : `+${value}`;
}

/** «1к6+3», «1к4−1», «1к8». */
export function formatDamage(dice: string, bonus: number): string {
  return bonus === 0 ? formatDice(dice) : `${formatDice(dice)}${formatModifier(bonus)}`;
}

export function rollDie(sides: number, rng: () => number = Math.random): number {
  return 1 + Math.floor(rng() * sides);
}

/** Бросок к20 с модификатором. Преимущество — берём большую из двух, помеха — меньшую. */
export function rollD20(modifier: number, mode: D20Mode = 'normal', rng: () => number = Math.random): D20Roll {
  const dice = mode === 'normal' ? [rollDie(20, rng)] : [rollDie(20, rng), rollDie(20, rng)];
  let keptIndex = 0;
  if (mode === 'advantage' && dice[1] > dice[0]) {
    keptIndex = 1;
  }
  if (mode === 'disadvantage' && dice[1] < dice[0]) {
    keptIndex = 1;
  }
  const natural = dice[keptIndex];
  return { dice, keptIndex, natural, total: natural + modifier };
}

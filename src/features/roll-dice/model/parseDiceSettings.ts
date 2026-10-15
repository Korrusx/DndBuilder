import { DEFAULT_DICE_SETTINGS, DICE_SKINS, DICE_STYLES, DICE_TABLES } from '../config/diceSettings';
import type { DiceSettings } from './types';

const oneOf = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);

/** Настройки бросков из meta.diceSettings (JSON). Неизвестные и испорченные значения заменяются значениями по умолчанию. */
export function parseDiceSettings(raw: string | null): DiceSettings {
  let v: Partial<Record<keyof DiceSettings, unknown>> = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === 'object') v = parsed;
  } catch {
    // испорченная запись — берём значения по умолчанию
  }
  const d = DEFAULT_DICE_SETTINGS;
  return {
    style: oneOf(DICE_STYLES, v.style, d.style),
    animation: typeof v.animation === 'boolean' ? v.animation : d.animation,
    skin: oneOf(DICE_SKINS, v.skin, d.skin),
    table: oneOf(DICE_TABLES, v.table, d.table),
    sound: typeof v.sound === 'boolean' ? v.sound : d.sound,
  };
}

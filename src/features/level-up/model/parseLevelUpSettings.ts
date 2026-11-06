import { DEFAULT_LEVEL_UP_SETTINGS } from '../config/settings';
import type { LevelUpSettings } from './types';

/** Настройки повышения уровня из meta.levelUpSettings (JSON); испорченное — значения по умолчанию. */
export function parseLevelUpSettings(raw: string | null): LevelUpSettings {
  let value: Partial<Record<keyof LevelUpSettings, unknown>> = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === 'object') {
      value = parsed;
    }
  } catch {
    // испорченная запись — берём значения по умолчанию
  }
  const defaults = DEFAULT_LEVEL_UP_SETTINGS;
  return {
    allowHpReroll: typeof value.allowHpReroll === 'boolean' ? value.allowHpReroll : defaults.allowHpReroll,
    animations: typeof value.animations === 'boolean' ? value.animations : defaults.animations,
  };
}

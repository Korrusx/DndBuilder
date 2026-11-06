import type { LevelUpSettings } from '../model/types';

/** Настройки повышения уровня по умолчанию: переброс хитов выключен, анимации включены. */
export const DEFAULT_LEVEL_UP_SETTINGS: LevelUpSettings = { allowHpReroll: true, animations: true, ownDice: false };

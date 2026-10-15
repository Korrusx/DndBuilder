import type { DiceSettings } from '../model/types';

export const DEFAULT_DICE_SETTINGS: DiceSettings = {
  style: '3d',
  animation: true,
  skin: 'amber',
  table: 'felt',
  sound: true,
};

export const DICE_STYLES = ['3d', 'simple'] as const;
export const DICE_SKINS = ['amber', 'obsidian', 'bone'] as const;
export const DICE_TABLES = ['felt', 'stone'] as const;

/** Высота стола с кубиками в панели броска. */
export const DICE_TABLE_HEIGHT = 260;
/** Если сцена не ответила «остановились» за это время (мс), показываем итог без неё. */
export const DICE_LANDED_TIMEOUT = 10000;
/** Кости, которые умеет 3D-стол. */
export const DICE_3D_SIDES = [4, 6, 8, 10, 12, 20];
/** Больше кубиков на столе не поместится — такой бросок показываем без 3D. */
export const DICE_3D_MAX = 20;

import type { DiceSound } from '../model/types';

// Звуки: стук и простой бросок нарезаны из записи (npm run dice:slice), камень, 20 и 1 синтезирует npm run dice:sounds.
export const DICE_SOUND_SOURCES: Record<DiceSound, number> = {
  roll: require('../../../../assets/sounds/dice/roll.wav'),
  crit: require('../../../../assets/sounds/dice/crit.wav'),
  fumble: require('../../../../assets/sounds/dice/fumble.wav'),
};

/** Простой бросок: звук естественной 20 или 1 — после того, как кости «упали» (мс). */
export const OUTCOME_SOUND_DELAY = 350;

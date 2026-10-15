import type { AudioPlayer } from 'expo-audio';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { DICE_SOUND_SOURCES } from '../config/diceSounds';
import type { DiceSound } from '../model/types';

const players: Partial<Record<DiceSound, AudioPlayer>> = {};
let modeSet = false;

function player(sound: DiceSound): AudioPlayer {
  if (!modeSet) {
    modeSet = true;
    // Не перебивать музыку на телефоне. Звучать и в режиме вибрации — как стук на 3D-столе; выключается в настройках бросков
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => undefined);
  }
  return (players[sound] ??= createAudioPlayer(DICE_SOUND_SOURCES[sound]));
}

/** Загружает звуки заранее, чтобы первый бросок прозвучал без задержки. */
export function preloadDiceSounds() {
  try {
    (Object.keys(DICE_SOUND_SOURCES) as DiceSound[]).forEach(player);
  } catch {
    // звук недоступен — броски работают и без него
  }
}

/** Играет звук броска с начала; ошибки звука не мешают броску. */
export function playDiceSound(sound: DiceSound, delayMs = 0) {
  if (delayMs > 0) {
    setTimeout(() => playDiceSound(sound), delayMs);
    return;
  }
  try {
    const p = player(sound);
    p.seekTo(0)
      .catch(() => undefined)
      .then(() => p.play());
  } catch {
    // звук недоступен
  }
}

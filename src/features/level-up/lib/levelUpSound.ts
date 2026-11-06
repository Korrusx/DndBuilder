// Звук заполнения кольца уровня на экране «Новый уровень».

import type { AudioPlayer } from 'expo-audio';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { LEVEL_UP_SOUND } from '../config/sounds';
import { INTRO } from './motion';

let player: AudioPlayer | null = null;

function levelUpPlayer(): AudioPlayer {
  if (!player) {
    // Как у звуков бросков: не перебивать музыку и звучать в беззвучном режиме.
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => undefined);
    player = createAudioPlayer(LEVEL_UP_SOUND);
  }
  return player;
}

/**
 * Играет звук с момента `atMs` таймлайна кольца (по умолчанию — с начала заполнения, где начинается файл):
 * при пропуске анимации — с удара, чтобы он всё равно прозвучал. Ошибки звука не мешают анимации.
 */
export function playLevelUpSound(atMs: number = INTRO.fillStart): void {
  try {
    const sound = levelUpPlayer();
    sound
      .seekTo(Math.max(0, atMs - INTRO.fillStart) / 1000)
      .catch(() => undefined)
      .then(() => sound.play());
  } catch {
    // звук недоступен
  }
}

/** Останавливает звук (уход с экрана, повтор анимации). */
export function stopLevelUpSound(): void {
  try {
    player?.pause();
  } catch {
    // звук недоступен
  }
}

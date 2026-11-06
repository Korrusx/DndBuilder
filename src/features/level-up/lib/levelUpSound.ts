// Звук заполнения кольца уровня на экране «Новый уровень».

import type { AudioPlayer } from 'expo-audio';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { LEVEL_UP_SOUND } from '../config/sounds';

let player: AudioPlayer | null = null;

function levelUpPlayer(): AudioPlayer {
  if (!player) {
    // Как у звуков бросков: не перебивать музыку и звучать в беззвучном режиме.
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => undefined);
    player = createAudioPlayer(LEVEL_UP_SOUND);
  }
  return player;
}

/** Играет звук с начала; ошибки звука не мешают анимации. */
export function playLevelUpSound(): void {
  try {
    const sound = levelUpPlayer();
    sound
      .seekTo(0)
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

import { useEffect, useRef, useState } from 'react';

import { OUTCOME_SOUND_DELAY } from '../config/diceSounds';
import { playDiceSound, preloadDiceSounds } from '../lib/diceSounds';
import { useDiceSettings } from './diceSettings';
import type { DiceOutcome } from './types';

/**
 * Бросок с показом на 3D-столе: числа известны сразу, а итог показываем, когда кости остановились.
 * `feel` — отклик телефона на итог, `outcome` — особый итог (естественная 20 или 1) для звука.
 */
export function useDiceReveal<T extends object>(feel: (roll: T) => void, outcome?: (roll: T) => DiceOutcome) {
  const settings = useDiceSettings();
  const [roll, setRoll] = useState<(T & { id: number; on3d: boolean }) | null>(null);
  const [landed, setLanded] = useState(true);
  // 3D не запустилось на этом устройстве — до перезапуска приложения показываем простой бросок.
  const [broken, setBroken] = useState(false);
  const nextId = useRef(1);
  // Какой бросок уже показан: сцена и страховочный таймер могут сообщить об одном броске дважды.
  const landedId = useRef(0);
  const use3d = settings.style === '3d' && !broken;
  const sound = settings.sound;

  useEffect(() => {
    if (sound) preloadDiceSounds();
  }, [sound]);

  /** `allow3d: false` — этот бросок не для стола (слишком много костей или необычная кость). */
  const show = (r: T, allow3d = true) => {
    const id = nextId.current++;
    const on3d = use3d && allow3d;
    setRoll({ ...r, id, on3d });
    setLanded(!on3d);
    if (!on3d) landedId.current = id;
    // На 3D-столе стук играет сама сцена; простой бросок звучит здесь
    if (sound && !on3d) {
      playDiceSound('roll');
      const o = outcome?.(r);
      if (o) playDiceSound(o, OUTCOME_SOUND_DELAY);
    }
  };

  const onLanded = (id: number) => {
    if (!roll || id !== roll.id || landedId.current === id) return;
    landedId.current = id;
    setLanded(true);
    feel(roll);
    const o = sound ? outcome?.(roll) : null;
    if (o) playDiceSound(o);
  };

  const onError = () => {
    setBroken(true);
    setLanded(true);
  };

  return { settings, use3d, roll, landed, show, onLanded, onError };
}

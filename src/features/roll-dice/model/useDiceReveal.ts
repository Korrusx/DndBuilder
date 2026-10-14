import { useRef, useState } from 'react';

import { useDiceSettings } from './diceSettings';

/**
 * Бросок с показом на 3D-столе: числа известны сразу, а итог показываем, когда кости остановились.
 * `feel` — отклик телефона на итог.
 */
export function useDiceReveal<T extends object>(feel: (roll: T) => void) {
  const settings = useDiceSettings();
  const [roll, setRoll] = useState<(T & { id: number; on3d: boolean }) | null>(null);
  const [landed, setLanded] = useState(true);
  // 3D не запустилось на этом устройстве — до перезапуска приложения показываем простой бросок.
  const [broken, setBroken] = useState(false);
  const nextId = useRef(1);
  // Какой бросок уже показан: сцена и страховочный таймер могут сообщить об одном броске дважды.
  const landedId = useRef(0);
  const use3d = settings.style === '3d' && !broken;

  /** `allow3d: false` — этот бросок не для стола (слишком много костей или необычная кость). */
  const show = (r: T, allow3d = true) => {
    const id = nextId.current++;
    const on3d = use3d && allow3d;
    setRoll({ ...r, id, on3d });
    setLanded(!on3d);
    if (!on3d) landedId.current = id;
  };

  const onLanded = (id: number) => {
    if (!roll || id !== roll.id || landedId.current === id) return;
    landedId.current = id;
    setLanded(true);
    feel(roll);
  };

  const onError = () => {
    setBroken(true);
    setLanded(true);
  };

  return { settings, use3d, roll, landed, show, onLanded, onError };
}

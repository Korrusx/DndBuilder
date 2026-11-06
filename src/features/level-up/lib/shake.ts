// Встряхивание телефона по акселерометру (expo-sensors): порог и частота — config/deck.ts.

import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';

import { SHAKE_INTERVAL_MS, SHAKE_SAMPLE_MS, SHAKE_THRESHOLD_G } from '../config/deck';

/** Это встряхивание? Ускорение (в g) выше порога и с прошлого прошло достаточно времени. */
export function isShake(sample: { x: number; y: number; z: number }, now: number, lastShakeAt: number): boolean {
  const force = Math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z);
  return force >= SHAKE_THRESHOLD_G && now - lastShakeAt >= SHAKE_INTERVAL_MS;
}

/** Слушать встряхивание, пока `enabled` (только на экране броска хитов). */
export function useShake(enabled: boolean, onShake: () => void): void {
  const handler = useRef(onShake);
  useEffect(() => {
    handler.current = onShake;
  }, [onShake]);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let last = 0;
    Accelerometer.setUpdateInterval(SHAKE_SAMPLE_MS);
    const subscription = Accelerometer.addListener((sample) => {
      const now = Date.now();
      if (isShake(sample, now, last)) {
        last = now;
        handler.current();
      }
    });
    return () => subscription.remove();
  }, [enabled]);
}

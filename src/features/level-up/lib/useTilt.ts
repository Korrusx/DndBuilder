import { DeviceMotion } from 'expo-sensors';
import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { deviation, smooth, TILT } from './tilt';

/**
 * Наклон телефона для карты героя: сглаженные β и γ в градусах от положения при включении (±20°).
 * Датчик слушается, только пока `enabled` и приложение активно; пока `paused.current` — значения не меняются.
 */
export function useTilt(enabled: boolean, paused: RefObject<boolean>) {
  const beta = useSharedValue(0);
  const gamma = useSharedValue(0);
  const active = useSharedValue(0);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!enabled || !appActive) {
      active.set(0);
      return;
    }
    let base: { beta: number; gamma: number } | null = null;
    let current = { beta: beta.get(), gamma: gamma.get() };
    DeviceMotion.setUpdateInterval(TILT.interval);
    const subscription = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation || paused.current) {
        return;
      }
      base ??= { beta: rotation.beta, gamma: rotation.gamma };
      current = {
        beta: smooth(current.beta, deviation(rotation.beta, base.beta)),
        gamma: smooth(current.gamma, deviation(rotation.gamma, base.gamma)),
      };
      beta.set(current.beta);
      gamma.set(current.gamma);
      active.set(1);
    });
    return () => {
      subscription.remove();
      active.set(0);
    };
  }, [enabled, appActive, paused, beta, gamma, active]);

  return { beta, gamma, active };
}

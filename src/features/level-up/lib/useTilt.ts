import { DeviceMotion } from 'expo-sensors';
import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useFrameCallback, useSharedValue, withTiming } from 'react-native-reanimated';

import type { Vec3 } from './tilt';
import { frameSmoothing, gravityTilt, TILT } from './tilt';

/**
 * Наклон телефона для карты героя: β (на себя / от себя) и γ (влево-вправо) в градусах от положения
 * при включении, ±20°. Датчик только задаёт цель; к ней значения плавно идут в UI-потоке на каждом кадре.
 * Датчик слушается, пока `enabled` и приложение активно; пока `paused.current` — цель не меняется.
 */
export function useTilt(enabled: boolean, paused: RefObject<boolean>) {
  const beta = useSharedValue(0);
  const gamma = useSharedValue(0);
  const targetBeta = useSharedValue(0);
  const targetGamma = useSharedValue(0);
  const active = useSharedValue(0);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  const frame = useFrameCallback((info) => {
    const k = frameSmoothing(info.timeSincePreviousFrame ?? TILT.smoothingFrame);
    beta.set(beta.get() + (targetBeta.get() - beta.get()) * k);
    gamma.set(gamma.get() + (targetGamma.get() - gamma.get()) * k);
  }, false);

  useEffect(() => {
    if (!enabled || !appActive) {
      active.set(0);
      frame.setActive(false);
      return;
    }
    let base: Vec3 | null = null;
    let shown = false;
    DeviceMotion.setUpdateInterval(TILT.interval);
    const subscription = DeviceMotion.addListener(({ accelerationIncludingGravity: total, acceleration: hand }) => {
      if (!total || paused.current) {
        return;
      }
      // Expo отдаёт силу тяжести направленной к земле; «верх» телефона — обратный вектор. Движение руки вычитается.
      const up = { x: -(total.x - (hand?.x ?? 0)), y: -(total.y - (hand?.y ?? 0)), z: -(total.z - (hand?.z ?? 0)) };
      base ??= up;
      const tilt = gravityTilt(up, base);
      targetBeta.set(tilt.beta);
      targetGamma.set(tilt.gamma);
      if (!shown) {
        shown = true;
        active.set(withTiming(1, { duration: TILT.fadeIn }));
      }
    });
    frame.setActive(true);
    return () => {
      subscription.remove();
      frame.setActive(false);
      active.set(0);
    };
  }, [enabled, appActive, paused, targetBeta, targetGamma, active, frame]);

  return { beta, gamma, active };
}

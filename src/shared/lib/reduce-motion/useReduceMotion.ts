import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Последний ответ системы: следующие экраны сразу получают его, а не «включено» до нового ответа. */
let known: boolean | null = null;

/** Включено ли в системе «уменьшение движения». Пока ни разу не известно — считаем, что включено (без анимаций). */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(known ?? true);
  useEffect(() => {
    let alive = true;
    const update = (value: boolean) => {
      known = value;
      if (alive) {
        setReduce(value);
      }
    };
    AccessibilityInfo.isReduceMotionEnabled()
      .then(update)
      .catch(() => update(false));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', update);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  return reduce;
}

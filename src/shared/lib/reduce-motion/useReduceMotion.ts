import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Включено ли в системе «уменьшение движения». Пока не известно — считаем, что включено (без анимаций). */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(true);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (alive) {
          setReduce(value);
        }
      })
      .catch(() => setReduce(false));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  return reduce;
}

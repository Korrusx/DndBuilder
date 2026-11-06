import { useReduceMotion } from '@/shared/lib/reduce-motion';

import { useLevelUpSettings } from '../model/levelUpSettings';

/** Анимации колоды: включены в настройках и не выключены системным «уменьшением движения». */
export function useDeckMotion(): boolean {
  const reduce = useReduceMotion();
  const { animations } = useLevelUpSettings();
  return animations && !reduce;
}

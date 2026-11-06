// Прокрутка списка карт к карте: «карта встаёт под ленту колоды с отступом 8» (deck-screen-spec.md, 4 и 5.3).
// Высоты карт меняются при разворачивании, поэтому позиция берётся из onLayout и прокрутка повторяется,
// пока раскладка не успокоится.

import { useCallback, useRef } from 'react';
import type { LayoutChangeEvent, ScrollViewInstance } from 'react-native';

import { CARD_SCROLL_GAP, CARD_SCROLL_SETTLE } from '../config/constants';

export function useCardScroll(animate: boolean) {
  const list = useRef<ScrollViewInstance>(null);
  const positions = useRef(new Map<string, number>());
  const target = useRef<{ id: string; until: number } | null>(null);

  const jump = useCallback(
    (id: string) => {
      const y = positions.current.get(id);
      if (y !== undefined) {
        list.current?.scrollTo({ y: Math.max(0, y - CARD_SCROLL_GAP), animated: animate });
      }
    },
    [animate],
  );

  const scrollTo = useCallback(
    (id: string) => {
      target.current = { id, until: Date.now() + CARD_SCROLL_SETTLE };
      requestAnimationFrame(() => jump(id));
    },
    [jump],
  );

  const onLayout = useCallback(
    (id: string) => (e: LayoutChangeEvent) => {
      positions.current.set(id, e.nativeEvent.layout.y);
      const wanted = target.current;
      if (wanted && wanted.id === id && Date.now() < wanted.until) {
        jump(id);
      }
    },
    [jump],
  );

  return { list, scrollTo, onLayout };
}

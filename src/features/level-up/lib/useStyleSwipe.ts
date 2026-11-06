import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { PanResponder } from 'react-native';

import { swipeStep } from './doneMotion';

type Handlers = {
  onStep: (step: 1 | -1) => void;
  /** Палец на карте: наклон ставится на паузу. */
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

function createSwipe(latest: RefObject<Handlers | null>) {
  const box = {
    get handlers() {
      return latest.current;
    },
  };
  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderGrant: () => box.handlers?.onDragStart?.(),
    onPanResponderRelease: (_, g) => {
      box.handlers?.onDragEnd?.();
      const step = swipeStep(g.dx, g.vx);
      if (step) {
        box.handlers?.onStep(step);
      }
    },
    onPanResponderTerminate: () => box.handlers?.onDragEnd?.(),
  });
  return responder.panHandlers;
}

/** Горизонтальный свайп по карте; вертикальное движение остаётся прокрутке. */
export function useStyleSwipe(handlers: Handlers) {
  const latest = useRef<Handlers | null>(null);
  useEffect(() => {
    latest.current = handlers;
  });
  // Ref читается только в обработчиках жеста, а не при отрисовке.
  // eslint-disable-next-line react-hooks/refs
  const [panHandlers] = useState(() => createSwipe(latest));
  return panHandlers;
}

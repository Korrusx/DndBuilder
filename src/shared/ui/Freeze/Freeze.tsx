import { Suspense, use } from 'react';

import type { FreezeProps } from './Freeze.types';

/** Обещание, которое никогда не выполнится: пока его «ждут», React не перерисовывает содержимое. */
const NEVER = new Promise<never>(() => {});

function Suspender({ freeze, children }: FreezeProps) {
  if (freeze) {
    use(NEVER);
  }
  return children;
}

/**
 * Заморозка части экрана: пока `freeze`, изменения данных её не перерисовывают; после снятия — одна
 * перерисовка со свежими данными. Тот же приём, что у react-freeze (Suspense), без зависимости.
 * Замороженное содержимое скрывается — подходит для экранов, которых не видно.
 */
export function Freeze({ freeze, children }: FreezeProps) {
  return (
    <Suspense fallback={null}>
      <Suspender freeze={freeze}>{children}</Suspender>
    </Suspense>
  );
}

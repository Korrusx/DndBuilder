import { emitPlayEvent, onPlayEvent } from '../playEvents';
import type { PlayEventMessage } from '../types';

test('подписчик получает события до отписки, ошибка подписчика не мешает остальным', () => {
  const got: PlayEventMessage[] = [];
  const offBroken = onPlayEvent(() => {
    throw new Error('сломан');
  });
  const off = onPlayEvent((message) => got.push(message));
  emitPlayEvent({ type: 'rest', rest: 'long' }, 'irma');
  off();
  offBroken();
  emitPlayEvent({ type: 'down' });
  expect(got).toEqual([{ characterId: 'irma', event: { type: 'rest', rest: 'long' } }]);
});

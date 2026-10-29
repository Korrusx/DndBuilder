import { i18n } from '@/shared/i18n';

import { coalesceEvents, entryEvent, eventText } from '../events';
import type { ChronicleEvent, TimelineItem } from '../types';
import { byId, entity, event, note } from './fixtures';

const at = (time: string) => `2026-10-29T${time}:00.000Z`;
const coins = (gp: number, direction: 'gain' | 'loss' = 'gain'): ChronicleEvent => ({
  type: 'loot',
  direction,
  items: [],
  coins: { gp },
});
const texts = (items: TimelineItem[]) =>
  items.map((item) => (item.kind === 'event' ? eventText(item.event) : `заметка: ${item.entry.text}`));

describe('автособытия', () => {
  afterEach(() => i18n.changeLanguage('ru'));

  test('натуральная 20 на Ловкость рук — запись события', () => {
    const entry = event('s12', at('19:48'), { type: 'natural', natural: 20, roll: 'Ловкость рук' });
    expect(entryEvent(entry)).toEqual({ type: 'natural', natural: 20, roll: 'Ловкость рук' });
    expect(eventText(entryEvent(entry)!)).toBe('Натуральная 20 · Ловкость рук');
  });

  test('+45 зм и +10 зм подряд → «Получено 55 зм»', () => {
    const items = coalesceEvents([event('s12', at('19:50'), coins(45)), event('s12', at('19:51'), coins(10))]);
    expect(texts(items)).toEqual(['Получено 55 зм']);
    expect(items[0].kind === 'event' && items[0].entries).toHaveLength(2);
  });

  test('находки за 2 минуты → «Найдено: ключ с якорем, 45 зм»', () => {
    const key: ChronicleEvent = {
      type: 'loot',
      direction: 'gain',
      items: [{ itemId: 'custom-key', name: 'ключ с якорем', quantity: 1 }],
      coins: {},
    };
    expect(texts(coalesceEvents([event('s12', at('19:49'), key), event('s12', at('19:50'), coins(45))]))).toEqual([
      'Найдено: ключ с якорем, 45 зм',
    ]);
  });

  test('не склеиваются: натуральные 20 подряд, позже 2 минут, через заметку, доход и расход, разные сессии', () => {
    const nat: ChronicleEvent = { type: 'natural', natural: 20, roll: 'Скрытность' };
    expect(coalesceEvents([event('s12', at('19:00'), nat), event('s12', at('19:00'), nat)])).toHaveLength(2);
    expect(coalesceEvents([event('s12', at('19:00'), coins(5)), event('s12', at('19:03'), coins(5))])).toHaveLength(2);
    expect(
      texts(
        coalesceEvents([
          event('s12', at('19:00'), coins(5)),
          note('s12', at('19:00'), 'Торгуемся'),
          event('s12', at('19:01'), coins(5)),
          event('s12', at('19:01'), coins(12, 'loss')),
          event('s11', at('19:01'), coins(12, 'loss')),
        ]),
      ),
    ).toEqual(['Получено 5 зм', 'заметка: Торгуемся', 'Получено 5 зм', 'Потрачено 12 зм', 'Потрачено 12 зм']);
  });

  test('уровни и 0 хитов не склеиваются', () => {
    const items = coalesceEvents([
      event('s12', at('19:00'), { type: 'down' }),
      event('s12', at('19:00'), { type: 'down' }),
      event('s12', at('19:00'), { type: 'level', level: 5 }),
      event('s12', at('19:00'), { type: 'level', level: 6 }),
    ]);
    expect(texts(items)).toEqual(['Хиты упали до 0', 'Хиты упали до 0', 'Новый уровень: 5', 'Новый уровень: 6']);
  });

  test('тексты: бой, квест по текущему имени, выплата, начало сессии', () => {
    expect(eventText({ type: 'combat', rounds: 3, dealt: 41, taken: 7 })).toBe('Бой: 3 раунда, урон 41, получено 7');
    expect(eventText({ type: 'combat', rounds: 5, dealt: 0, taken: 0 })).toBe('Бой: 5 раундов, урон 0, получено 0');
    const quest = entity('cellar', 'Что в подвале таверны', 'quest');
    expect(eventText({ type: 'quest', questId: 'cellar', name: 'Подвал', change: 'done' }, byId([quest]))).toBe(
      'Квест выполнен: Что в подвале таверны',
    );
    expect(eventText({ type: 'payment', questId: 'debt', name: 'Долг «Тихим рукам»', amount: 50, unit: 'gp' })).toBe(
      'Выплачено 50 зм: Долг «Тихим рукам»',
    );
    expect(eventText({ type: 'sessionStart', hp: { current: 38, max: 38 } })).toBe('Начало сессии · хиты 38/38');
  });

  test('английский текст', async () => {
    await i18n.changeLanguage('en');
    expect(eventText(coins(55))).toBe('Gained 55 gp');
    expect(eventText({ type: 'combat', rounds: 1, dealt: 9, taken: 2 })).toBe('Combat: 1 round, dealt 9, taken 2');
  });
});

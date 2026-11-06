import type { Character } from '@/entities/character';
import { withDefaults } from '@/entities/character';
import { content } from '@/shared/content';

import { irmaAt } from '../../model/deck/__tests__/fixtures';
import { levelUpDeck } from '../../model/deck/levelUpDeck';
import { startLevelUp } from '../../model/levelup';
import {
  cardA11yLabel,
  cardFooter,
  cardNext,
  cardSubtitle,
  cardUnlocked,
  defaultCardStyle,
  pickCardStats,
} from '../heroCard';

const withClasses = (classes: Character['classes']): Character => ({ ...irmaAt(1), classes });

describe('карта героя: медальоны', () => {
  test('Ирма 5 → 6, компетентность в Восприятии и Акробатике, на кубике 6', () => {
    const prev = { ...irmaAt(5), expertise: ['stealth', 'sleight-of-hand'] };
    const next = { ...startLevelUp(prev), expertise: [...prev.expertise, 'perception', 'acrobatics'] };
    const deck = levelUpDeck(prev, next, content, { hp: { method: 'roll', value: 6 } });
    expect(pickCardStats(deck.before, deck.after, content, next.expertise)).toEqual([
      { label: 'ХИТЫ', value: '46', change: '+8' },
      { label: 'ВОСПРИЯТИЕ', value: '+7', change: '+3' },
      { label: 'АКРОБАТИКА', value: '+10', change: '+3' },
    ]);
    expect(cardUnlocked(deck, prev, next, content)).toBe('Компетентность: Восприятие и Акробатика');
  });

  test('уровень с одним изменением: остальные медальоны — КЗ и атака без изменения', () => {
    const prev = irmaAt(7);
    const deck = levelUpDeck(prev, startLevelUp(prev), content);
    const stats = pickCardStats(deck.before, deck.after, content);
    expect(stats[0]).toMatchObject({ label: 'ХИТЫ', change: '+7' });
    expect(stats.slice(1)).toEqual([
      { label: 'КЗ', value: String(deck.after.sheet.armorClass), change: null },
      { label: 'АТАКА', value: `+${deck.after.sheet.attacks[0].toHit}`, change: null },
    ]);
  });

  test('рост скрытой атаки: «4к6», изменение «+1к6»', () => {
    const prev = irmaAt(6);
    const deck = levelUpDeck(prev, startLevelUp(prev), content);
    expect(pickCardStats(deck.before, deck.after, content)).toContainEqual({
      label: 'СКР. АТАКА',
      value: '4к6',
      change: '+1к6',
    });
  });

  test('подпись для диктора', () => {
    expect(cardA11yLabel('Ирма Вейл', 6, [{ label: 'ХИТЫ', value: '46', change: '+8' }])).toBe(
      'Карта героя: Ирма Вейл, 6-й уровень. Хиты 46, плюс 8.',
    );
  });
});

describe('карта героя: тексты', () => {
  test('подзаголовок: один класс с подклассом и мультикласс', () => {
    expect(cardSubtitle(irmaAt(6))).toBe('Полурослик · Плут · Вор');
    expect(
      cardSubtitle(
        withClasses([
          { classId: 'rogue', subclassId: 'thief', level: 5 },
          { classId: 'wizard', level: 1 },
        ]),
      ),
    ).toBe('Полурослик · Плут 5 / Волшебник 1');
  });

  test('«Дальше»: на 7-м уровне умения; на 20-м — null', () => {
    expect(cardNext(irmaAt(6), content, 'rogue')).toBe('Дальше, на 7-м: Увёртливость, Надёжный талант');
    expect(cardNext(irmaAt(20), content, 'rogue')).toBeNull();
  });

  test('подвал: кампания и сессия; без кампании — только дата ДД.ММ.ГГГГ', () => {
    const date = new Date(2026, 10, 6);
    expect(cardFooter('Тени Солёной Гавани', 12, date)).toBe('Тени Солёной Гавани · сессия 12 · 06.11.2026');
    expect(cardFooter(undefined, undefined, date)).toBe('06.11.2026');
  });
});

describe('стиль карты', () => {
  test('по классу: заклинатели — «Ночь», остальные — «Янтарь»', () => {
    expect(defaultCardStyle(withClasses([{ classId: 'wizard', level: 3 }]))).toBe('night');
    expect(defaultCardStyle(withClasses([{ classId: 'rogue', level: 3 }]))).toBe('amber');
    expect(
      defaultCardStyle(
        withClasses([
          { classId: 'rogue', level: 3 },
          { classId: 'warlock', level: 5 },
        ]),
      ),
    ).toBe('night');
    // Поровну уровней — решает первый взятый класс.
    expect(
      defaultCardStyle(
        withClasses([
          { classId: 'rogue', level: 3 },
          { classId: 'warlock', level: 3 },
        ]),
      ),
    ).toBe('amber');
  });

  test('выбранный стиль сохраняется у персонажа и восстанавливается после загрузки', () => {
    const chosen = { ...irmaAt(6), heroCardStyle: 'parchment' as const };
    const saved = JSON.parse(JSON.stringify(chosen)) as Partial<Character>;
    const loaded = withDefaults(saved, { id: chosen.id, createdAt: chosen.createdAt, updatedAt: chosen.updatedAt });
    expect(loaded.heroCardStyle).toBe('parchment');
    expect(defaultCardStyle(loaded)).toBe('parchment');
  });
});

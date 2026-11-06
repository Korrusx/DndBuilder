// Экран «Новое на N-м уровне»: счётчик, сводки, короткие названия, группы роста.

import type { Character } from '@/entities/character';
import { content } from '@/shared/content';

import { levelUpDeck } from '../../model/deck/levelUpDeck';
import { dragonbornPaladin, irmaAt } from '../../model/deck/__tests__/fixtures';
import { startLevelUp } from '../../model/levelup';
import type { Deck, LevelChoice, LevelUpCard } from '../../model/types';
import { cardShortTitle } from '../cardText';
import { deckProgress, firstPendingCard } from '../deckProgress';
import { cardSummary, groupGrowthRows, growthParts } from '../deckSummary';
import { pickedItems } from '../pickedItems';

/** Каэлан, драконорождённый паладин Клятвы преданности 4-го уровня: приёмы оружия и 5 заклинаний уже выбраны. */
const kaelan = (): Character => ({
  ...dragonbornPaladin([{ classId: 'paladin', subclassId: 'oath-of-devotion', level: 4 }]),
  name: 'Каэлан',
  weaponMasteries: ['longsword', 'javelin'],
  preparedSpells: ['bless', 'command', 'cure-wounds', 'detect-magic', 'divine-favor'],
});
const withAid = (c: Character): Character => ({ ...c, preparedSpells: [...c.preparedSpells, 'aid'] });
const deckOf = (prev: Character, next = startLevelUp(prev), revealed: string[] = []) =>
  levelUpDeck(prev, next, content, { revealed });
const find = (deck: Deck, id: string) => deck.cards.find((card) => card.id === id)!;

const choiceOf = (id: string, extra: Partial<LevelChoice> = {}): LevelChoice => ({
  id,
  kind: 'skills',
  required: true,
  blocking: true,
  count: 1,
  picked: 0,
  done: false,
  source: 'class',
  classId: 'rogue',
  problems: [],
  ...extra,
});
const cardOf = (id: string, state: LevelUpCard['state'], choice?: LevelChoice): LevelUpCard => ({
  id,
  type: choice ? 'choice' : 'feature',
  source: { kind: 'class', id: 'rogue' },
  state,
  ...(choice ? { choice } : {}),
});
const deckWith = (cards: LevelUpCard[]): Deck => ({
  cards,
  blockers: [],
  counts: { news: cards.length, choices: 0 },
  unchanged: [],
});

describe('deckProgress', () => {
  test('Каэлан 4 → 5: открыты хиты, рост и «Дополнительная атака», заклинания не выбраны', () => {
    const prev = kaelan();
    const deck = deckOf(prev, undefined, ['hp', 'growth', 'feature.paladin-extra-attack']);
    // Вид — две карты: новая особенность «Полёт дракона» и рост дыхания (логика колоды).
    expect(deck.cards.map((card) => card.id)).toEqual([
      'hp',
      'growth',
      'feature.paladin-extra-attack',
      'feature.paladin-faithful-steed',
      'magic.paladin',
      'species.draconic-flight',
      'species',
    ]);
    expect(deckProgress(deck, [])).toEqual({
      hpDecided: true,
      revealed: 3,
      total: 7,
      choicesDone: 0,
      choicesTotal: 1,
      choicesRequired: 1,
      ready: false,
      hint: 'Осталось открыть 4 карты и сделать 1 выбор',
    });
  });

  test('всё открыто и заклинание выбрано — можно к итогу', () => {
    const prev = kaelan();
    const all = deckOf(prev).cards.map((card) => card.id);
    const deck = deckOf(prev, withAid(startLevelUp(prev)), all);
    expect(deckProgress(deck, [])).toMatchObject({ revealed: 7, choicesDone: 1, ready: true });
    expect(deckProgress(deck, []).hint).toBe('Всё открыто · можно к итогу');
  });

  test('открытые карты восстанавливаются из PendingLevelUp.revealed', () => {
    const deck = deckOf(kaelan(), undefined, ['hp', 'magic.paladin']);
    expect(find(deck, 'hp').state).toBe('done');
    expect(find(deck, 'magic.paladin').state).toBe('revealed');
    expect(find(deck, 'growth').state).toBe('hidden');
  });

  test.each([
    [1, 0, 'Осталось открыть 1 карту'],
    [2, 0, 'Осталось открыть 2 карты'],
    [5, 0, 'Осталось открыть 5 карт'],
    [0, 1, 'Осталось сделать 1 выбор'],
    [0, 2, 'Осталось сделать 2 выбора'],
    [0, 5, 'Осталось сделать 5 выборов'],
    [3, 2, 'Осталось открыть 3 карты и сделать 2 выбора'],
  ])('склонения: %i карт, %i выборов', (hidden, choices, hint) => {
    const cards = [
      ...Array.from({ length: hidden }, (_, i) => cardOf(`f${i}`, 'hidden')),
      ...Array.from({ length: choices }, (_, i) => cardOf(`c${i}`, 'revealed', choiceOf(`c${i}`))),
    ];
    expect(deckProgress(deckWith(cards), []).hint).toBe(hint);
  });

  test('необязательный выбор закрыт «Не менять»', () => {
    const optional = choiceOf('replace', { kind: 'replaceOption', required: false, blocking: false, done: true });
    const deck = deckWith([cardOf('replace', 'done', optional)]);
    expect(deckProgress(deck, []).ready).toBe(false);
    expect(deckProgress(deck, ['replace'])).toMatchObject({ ready: true, choicesDone: 1, choicesRequired: 0 });
  });
});

describe('хиты в колоде', () => {
  test('Ирма 5 → 6 до броска: «хиты не брошены», «Дальше» неактивна, хиты — первыми', () => {
    const deck = deckOf(irmaAt(5), undefined, ['hp']);
    const progress = deckProgress(deck, [], false);
    // «Открыто 1 из 2 · хиты не брошены · выборов 0 из 1».
    expect(progress).toMatchObject({ revealed: 1, total: 2, hpDecided: false, ready: false, choicesDone: 0 });
    expect(progress.hint).toBe('Осталось бросить хиты, открыть 1 карту и сделать 1 выбор');
    const opened = deckOf(irmaAt(5), undefined, ['hp', 'choice.expertise']);
    expect(deckProgress(opened, [], false).hint).toBe('Осталось бросить хиты и сделать 1 выбор');
    expect(firstPendingCard(deck, [], false)).toBe('hp');
    expect(firstPendingCard(deck, [], true)).toBe('choice.expertise');
  });

  test('подсказки: только хиты; хиты, карты и выборы', () => {
    const hpCard: LevelUpCard = { id: 'hp', type: 'hp', source: { kind: 'class' }, state: 'revealed' };
    expect(deckProgress(deckWith([hpCard]), [], false).hint).toBe('Осталось бросить хиты');
    const deck = deckWith([hpCard, cardOf('f', 'hidden'), cardOf('c', 'revealed', choiceOf('c'))]);
    expect(deckProgress(deck, [], false).hint).toBe('Осталось бросить хиты, открыть 1 карту и сделать 1 выбор');
  });
});

describe('firstPendingCard', () => {
  test('закрытая карта выше карты с выбором — она первая', () => {
    const choice = cardOf('choice', 'revealed', choiceOf('choice'));
    expect(firstPendingCard(deckWith([cardOf('hp', 'done'), cardOf('feat', 'hidden'), choice]), [])).toBe('feat');
    expect(firstPendingCard(deckWith([cardOf('hp', 'done'), choice, cardOf('feat', 'hidden')]), [])).toBe('choice');
    expect(firstPendingCard(deckWith([cardOf('hp', 'done')]), [])).toBeNull();
  });
});

describe('cardSummary', () => {
  const prev = kaelan();
  const deck = deckOf(prev);

  test('«Дополнительная атака»: источник и метки', () => {
    expect(cardSummary(find(deck, 'feature.paladin-extra-attack'))).toBe('паладин 5 · действие «Атака» · 2 атаки');
  });

  test('магия паладина: 2-й круг и выбранная «Подмога»', () => {
    const next = withAid(startLevelUp(prev));
    const magic = find(deckOf(prev, next), 'magic.paladin');
    const picked = pickedItems(magic.choice!, prev, next, content);
    expect(picked).toEqual([{ id: 'aid', name: 'Подмога', circle: 2 }]);
    expect(cardSummary(magic, { picked })).toBe('2 круг · Подмога');
    expect(cardSummary(find(deck, 'magic.paladin'))).toBe('2 круг · нужен выбор');
  });

  test('«Полёт дракона» с ростом дыхания', () => {
    const flight = find(deck, 'species.draconic-flight');
    const breath = find(deck, 'species').rows!;
    const card = { ...flight, tags: flight.tags!.filter((tag) => tag.kind === 'action'), rows: breath };
    expect(cardSummary(card)).toBe('вид · бонусное действие · и ещё: оружие дыхания: огонь 1к10 → 2к10');
  });

  test('хиты и выбор', () => {
    expect(cardSummary(find(deck, 'hp'))).toBe('36 → 44');
    const irma = deckOf(irmaAt(5));
    expect(cardSummary(find(irma, 'choice.expertise'))).toBe('нужен выбор');
    expect(cardSummary(find(irma, 'choice.expertise'), { picked: [{ id: 'a', name: 'Атлетика' }] })).toBe('Атлетика');
  });
});

describe('cardShortTitle', () => {
  test('по словарю и по типу', () => {
    const deck = deckOf(kaelan());
    expect(cardShortTitle(find(deck, 'feature.paladin-extra-attack'))).toBe('Доп. атака');
    expect(cardShortTitle(find(deck, 'feature.paladin-faithful-steed'))).toBe('Скакун');
    expect(cardShortTitle(find(deck, 'magic.paladin'))).toBe('Магия');
    expect(cardShortTitle(find(deck, 'species'))).toBe('Вид');
  });
});

describe('groupGrowthRows', () => {
  test('рост паладина: группы по порядку, без пустых', () => {
    const growth = find(deckOf(kaelan()), 'growth');
    const { main, rest } = growthParts(growth.rows!);
    expect(main?.label).toEqual({ kind: 'number', key: 'profBonus' });
    const groups = groupGrowthRows(rest);
    expect(groups.map((group) => group.id)).toEqual(['saves', 'skills', 'attacks', 'magic', 'other']);
    expect(groups.every((group) => group.rows.length > 0)).toBe(true);
    expect(groups.flatMap((group) => group.rows)).toHaveLength(rest.length);
  });
});

describe('Ирма 5 → 6', () => {
  test('две карты: хиты и выбор «Компетентность»', () => {
    const deck = deckOf(irmaAt(5));
    expect(deck.cards.map((card) => [card.type, card.choice?.kind])).toEqual([
      ['hp', undefined],
      ['choice', 'expertise'],
    ]);
  });
});

import type { Character } from '@/entities/character';
import { computeSheet } from '@/entities/character';
import { content, contentFor } from '@/shared/content';

import { canMulticlassInto, startLevelUp } from '../../levelup';
import type { CardRow, LevelUpCard } from '../../types';
import { buildDeck } from '../buildDeck';
import { diffSheets, isEmptyDiff } from '../diffSheets';
import { hpGain } from '../hpGain';
import { levelUpDeck } from '../levelUpDeck';
import { choicePreview, keyNumbersPreview, nextLevelPreview } from '../previews';
import { levelSnapshot } from '../snapshot';
import { dragonbornPaladin, hero, hero2014, irmaAt, irmaCon14At7, liraAt4 } from './fixtures';

const deckOf = (prev: Character, next: Character = startLevelUp(prev), c = content) => levelUpDeck(prev, next, c);
const card = (cards: LevelUpCard[], id: string) => cards.find((x) => x.id === id);
const types = (cards: LevelUpCard[]) => cards.map((x) => x.type);
const row = (rows: CardRow[] | undefined, match: Partial<CardRow['label']>) =>
  rows?.find((r) => Object.entries(match).every(([k, v]) => (r.label as Record<string, unknown>)[k] === v));

describe('diffSheets', () => {
  test('одинаковые листы — пустая разница', () => {
    const irma = irmaAt(5);
    const snapshot = levelSnapshot(irma, content);
    expect(isEmptyDiff(diffSheets(snapshot, snapshot, content))).toBe(true);
    expect(isEmptyDiff(diffSheets(snapshot, levelSnapshot(startLevelUp(irma), content), content))).toBe(false);
  });
});

describe('Ирма Вейл, плут (Вор)', () => {
  test('4 → 5: бонус мастерства со списком чисел, скрытая атака, «Хитрый удар» и «Невероятное уклонение»', () => {
    const deck = deckOf(irmaAt(4));
    expect(types(deck.cards)).toEqual(['hp', 'growth', 'feature', 'feature']);

    const growth = card(deck.cards, 'growth')!.rows;
    const pb = row(growth, { kind: 'number', key: 'profBonus' })!;
    expect(pb).toMatchObject({ before: 2, after: 3 });
    // Все изменившиеся от мастерства числа — под строкой бонуса мастерства.
    expect(row(pb.details, { key: 'skill', ref: 'stealth' })).toMatchObject({ before: 8, after: 10 });
    expect(row(pb.details, { key: 'skill', ref: 'perception' })).toMatchObject({ before: 3, after: 4 });
    expect(row(pb.details, { key: 'save', ref: 'dex' })).toMatchObject({ before: 6, after: 7 });
    expect(row(pb.details, { key: 'attack', ref: 'shortsword' })).toMatchObject({ before: 6, after: 7 });
    expect(row(pb.details, { key: 'passivePerception' })).toMatchObject({ before: 13, after: 14 });
    expect(row(growth, { kind: 'column', column: 'sneak_attack' })).toMatchObject({ before: '2d6', after: '3d6' });

    expect(card(deck.cards, 'feature.rogue-cunning-strike')).toBeDefined();
    expect(card(deck.cards, 'feature.rogue-uncanny-dodge')?.tags).toEqual([{ kind: 'action', action: 'reaction' }]);
    expect(deck.blockers).toEqual([]);
    expect(deck.unchanged).toEqual([]);
  });

  test('5 → 6: хиты к8 (среднее 5), компетентность на 2 владеемых навыка, без магии и вида', () => {
    const prev = { ...irmaAt(5), expertise: ['stealth', 'sleight-of-hand'] };
    const next = startLevelUp(prev);
    const deck = deckOf(prev, next);
    expect(types(deck.cards)).toEqual(['hp', 'choice']);
    expect(card(deck.cards, 'hp')?.hp).toMatchObject({
      die: 8,
      gain: 7,
      breakdown: [
        { kind: 'die', method: 'average', die: 8, value: 5 },
        { kind: 'con', value: 2 },
      ],
    });
    const expertise = card(deck.cards, 'choice.expertise')!;
    expect(expertise.choice).toMatchObject({ kind: 'expertise', count: 2, required: true, done: false });
    expect(expertise.ref).toEqual({ table: 'features', id: 'rogue-expertise' });
    expect(deck.blockers.map((b) => b.kind)).toEqual(['expertise']);
    expect(deck.unchanged).toEqual(['profBonus', 'dice']);

    // Выбор сделан — «Дальше» открыта.
    const chosen = { ...next, expertise: [...prev.expertise, 'perception', 'acrobatics'] };
    expect(deckOf(prev, chosen).blockers).toEqual([]);

    // Предпросмотр варианта «Восприятие»: навык растёт на бонус мастерства, побочно — пассивное восприятие.
    const preview = choicePreview(
      levelSnapshot(next, content),
      levelSnapshot({ ...next, expertise: [...prev.expertise, 'perception'] }, content),
      content,
    );
    expect(preview.rows).toEqual([{ label: { kind: 'number', key: 'skill', ref: 'perception' }, before: 4, after: 7 }]);
    expect(preview.sideEffect).toEqual({ label: { kind: 'number', key: 'passivePerception' }, before: 14, after: 17 });
  });

  test('5 → 6 «На следующем уровне»: «Увёртливость», «Надёжный талант», скрытая атака 4к6', () => {
    const items = nextLevelPreview(irmaAt(6), content);
    expect(items).toEqual([
      { kind: 'feature', id: 'rogue-evasion', source: 'class' },
      { kind: 'feature', id: 'rogue-reliable-talent', source: 'class' },
      {
        kind: 'row',
        row: { label: { kind: 'column', classId: 'rogue', column: 'sneak_attack' }, before: '3d6', after: '4d6' },
      },
    ]);
    expect(nextLevelPreview(irmaAt(20), content)).toEqual([]);
  });

  test('7 → 8 с улучшением ТЕЛ 14 → 16: кубик + новый модификатор + пересчёт за 7 прошлых уровней', () => {
    const prev = irmaCon14At7();
    const next: Character = {
      ...startLevelUp(prev),
      feats: [
        ...prev.feats,
        { featId: 'ability-score-improvement', source: 'class', level: 8, abilityIncreases: { con: 2 } },
      ],
    };
    expect(computeSheet(prev, content).abilities.con.score).toBe(14);
    expect(computeSheet(next, content).abilities.con.score).toBe(16);
    const hp = card(deckOf(prev, next).cards, 'hp')!.hp!;
    expect(hp.breakdown).toEqual([
      { kind: 'die', method: 'average', die: 8, value: 5 },
      { kind: 'con', value: 3 },
      { kind: 'retroCon', perLevel: 1, levels: 7, value: 7 },
    ]);
    expect(hp.gain).toBe(15);
    expect(hp.maxAfter - hp.maxBefore).toBe(computeSheet(next, content).maxHp - computeSheet(prev, content).maxHp);
  });

  test('10 → 11: «Улучшенный хитрый удар» — улучшение «Хитрого удара», а не «удалено + добавлено»', () => {
    const prev = irmaAt(10);
    const deck = deckOf(prev);
    const improved = card(deck.cards, 'feature.rogue-improved-cunning-strike');
    expect(improved?.upgradedFrom).toBe('rogue-cunning-strike');
    const diff = diffSheets(levelSnapshot(prev, content), levelSnapshot(startLevelUp(prev), content), content);
    expect(diff.added.map((f) => f.id)).not.toContain('rogue-improved-cunning-strike');
    expect(diff.removed).toEqual([]);
  });

  test('мультикласс плут 5 → плут 5 / волшебник 1', () => {
    const prev = irmaAt(5);
    expect(canMulticlassInto(prev, content, 'wizard')).toBe(true);
    // Плут не заклинатель, поэтому волшебник — основной: его заговоры в общих полях персонажа.
    const next: Character = { ...startLevelUp(prev, 'wizard'), cantrips: ['fire-bolt'] };
    const deck = deckOf(prev, next);
    expect(types(deck.cards)).toEqual(['hp', 'multiclass', 'magic']);
    // Хиты без максимума кости: среднее к6 + ТЕЛ.
    expect(card(deck.cards, 'hp')?.hp).toMatchObject({ die: 6, gain: 4 + 2 });
    const multiclass = card(deck.cards, 'multiclass.wizard')!;
    expect(row(multiclass.rows, { kind: 'feature', id: 'wizard-arcane-recovery' })).toBeDefined();
    // Ячейки по таблице мультикласса (один заклинатель — по таблице волшебника 1-го уровня).
    const magic = card(deck.cards, 'magic.wizard')!;
    expect(row(magic.rows, { kind: 'slots', circle: 1 })).toMatchObject({ before: 0, after: 2 });
    expect(row(magic.rows, { kind: 'limit', limit: 'spellbook' })).toMatchObject({ after: 6 });
    // Урон заговора — по общему уровню 6.
    expect(levelSnapshot(next, content).cantripDamage['fire-bolt']).toBe('2d10');
  });
});

describe('Лира, жрица', () => {
  test('4 → 5: 3-й круг, новые подготовленные обязательны, «Священное пламя» 1к8 → 2к8', () => {
    const prev = liraAt4();
    const deck = deckOf(prev);
    expect(types(deck.cards)).toEqual(['hp', 'growth', 'feature', 'magic']);
    const magic = card(deck.cards, 'magic.cleric')!;
    expect(row(magic.rows, { kind: 'slots', circle: 3 })).toMatchObject({ before: 0, after: 2 });
    expect(row(magic.rows, { kind: 'limit', limit: 'prepared' })).toMatchObject({ before: 7, after: 9 });
    expect(magic.choice).toMatchObject({ kind: 'spells', count: 2, required: true, done: false });
    expect(deck.blockers.map((b) => b.kind)).toEqual(['spells']);
    expect(row(card(deck.cards, 'growth')!.rows, { kind: 'cantrip', spellId: 'sacred-flame' })).toMatchObject({
      before: '1d8',
      after: '2d8',
    });
    expect(card(deck.cards, 'feature.cleric-sear-undead')).toBeDefined();
    // Заклинания выбраны — блокировки нет.
    const next = startLevelUp(prev);
    const chosen = { ...next, preparedSpells: [...prev.preparedSpells, 'blindness-deafness', 'calm-emotions'] };
    expect(deckOf(prev, chosen).blockers).toEqual([]);
  });
});

describe('воин', () => {
  const fighter = (level: number) =>
    hero('fighter', level, { classes: [{ classId: 'fighter', subclassId: 'champion', level }] });

  test('4 → 5: «Дополнительная атака» и рост бонуса мастерства', () => {
    const deck = deckOf(fighter(4));
    expect(card(deck.cards, 'feature.fighter-extra-attack')?.tags).toEqual([{ kind: 'action', action: 'passive' }]);
    expect(row(card(deck.cards, 'growth')!.rows, { kind: 'number', key: 'profBonus' })).toMatchObject({
      before: 2,
      after: 3,
    });
  });

  test('5 → 6: черта или улучшение характеристик; 18 → 19: эпический дар', () => {
    expect(card(deckOf(fighter(5)).cards, 'choice.feat')?.choice).toMatchObject({ featSlot: 'asi', required: true });
    expect(card(deckOf(fighter(18)).cards, 'choice.feat')?.choice).toMatchObject({
      featSlot: 'epic-boon',
      required: true,
    });
  });

  test('19 → 20: вершина — «Три дополнительные атаки» улучшают «Две»', () => {
    const deck = deckOf(fighter(19));
    const capstone = card(deck.cards, 'feature.fighter-three-extra-attacks');
    expect(capstone).toMatchObject({ type: 'capstone', upgradedFrom: 'fighter-two-extra-attacks' });
    expect(deck.cards.at(-1)?.type).toBe('capstone');
  });
});

describe('колдун', () => {
  const warlock = (level: number, invocations: string[]) =>
    hero('warlock', level, {
      classes: [{ classId: 'warlock', subclassId: 'fiend-patron', level }],
      choices: { 'class.warlock.invocations': invocations },
    });

  test('4 → 5: выбор ровно разницы воззваний, замена — необязательно, ячейки договора 2 → 3 круг', () => {
    const prev = warlock(4, ['armor-of-shadows', 'eldritch-mind', 'pact-of-the-blade']);
    const deck = deckOf(prev);
    expect(card(deck.cards, 'choice.class.warlock.invocations')?.choice).toMatchObject({
      kind: 'classOption',
      count: 2,
      required: true,
    });
    expect(card(deck.cards, 'choice.class.warlock.invocations.replace')?.choice).toMatchObject({
      kind: 'replaceOption',
      required: false,
    });
    const pact = row(card(deck.cards, 'magic.warlock')!.rows, { kind: 'pact' });
    expect(pact).toEqual({ label: { kind: 'pact' }, before: { count: 2, circle: 2 }, after: { count: 2, circle: 3 } });
  });
});

describe('волшебник 2014', () => {
  const c14 = contentFor('2014');
  test('1 → 2: выбор магической традиции на карте «Магическая традиция», книга +2', () => {
    const deck = deckOf(hero2014('wizard', 1), undefined, c14);
    // Строка таблицы «Магическая традиция» — сама карта выбора подкласса, отдельной карты умения нет.
    expect(card(deck.cards, 'feature.arcane-tradition')).toBeUndefined();
    expect(card(deck.cards, 'choice.subclass')).toMatchObject({
      type: 'choice',
      ref: { table: 'features', id: 'arcane-tradition' },
      choice: { kind: 'subclass', required: true },
    });
    const magic = card(deck.cards, 'magic.wizard')!;
    expect(row(magic.rows, { kind: 'limit', limit: 'spellbook' })).toMatchObject({ before: 6, after: 8 });
  });
});

describe('драконорождённый', () => {
  test('паладин 4 → 5: «Полёт дракона», дыхание 1к10 → 2к10, «Дополнительная атака», 2-й круг', () => {
    const deck = deckOf(dragonbornPaladin([{ classId: 'paladin', subclassId: 'oath-of-devotion', level: 4 }]));
    expect(card(deck.cards, 'species.draconic-flight')?.tags).toEqual([
      { kind: 'action', action: 'bonus' },
      { kind: 'uses', max: 1, recovery: 'long' },
    ]);
    expect(
      row(card(deck.cards, 'species')!.rows, { kind: 'trait', traitId: 'draconic-breath-weapon-fire' }),
    ).toMatchObject({
      before: '1d10',
      after: '2d10',
    });
    // Заряды дыхания = бонус мастерства — в росте.
    expect(row(card(deck.cards, 'growth')!.rows, { kind: 'resource', id: 'breath-weapon' })).toMatchObject({
      before: { max: 2 },
      after: { max: 3 },
    });
    expect(card(deck.cards, 'feature.paladin-extra-attack')).toBeDefined();
    expect(row(card(deck.cards, 'magic.paladin')!.rows, { kind: 'slots', circle: 2 })).toMatchObject({
      before: 0,
      after: 2,
    });
    expect(types(deck.cards).slice(-2)).toEqual(['species', 'species']);
  });

  test('паладин 3 / волшебник 1 → общий 5-й: полёт тоже открывается (умения вида — по общему уровню)', () => {
    const deck = deckOf(
      dragonbornPaladin([
        { classId: 'paladin', subclassId: 'oath-of-devotion', level: 3 },
        { classId: 'wizard', level: 1 },
      ]),
    );
    expect(card(deck.cards, 'species.draconic-flight')).toBeDefined();
  });

  test('2014, 5 → 6: дыхание 2к6 → 3к6', () => {
    const c14 = contentFor('2014');
    const prev = hero2014('fighter', 5, {
      speciesId: 'dragonborn',
      choices: { 'trait.draconic-ancestry.option': ['draconic-ancestry-red'] },
    });
    const species = card(deckOf(prev, undefined, c14).cards, 'species');
    expect(row(species?.rows, { kind: 'trait', traitId: 'breath-weapon' })).toMatchObject({
      before: '2d6',
      after: '3d6',
    });
  });
});

describe('дварф: бонус к хитам за уровень', () => {
  test('2024: «+1 дварфийская стойкость» в разборе', () => {
    const hp = card(deckOf(hero('fighter', 2, { speciesId: 'dwarf' })).cards, 'hp')!.hp!;
    expect(hp.breakdown).toContainEqual({ kind: 'bonus', sourceId: 'dwarven-toughness', value: 1 });
  });

  test('2014: холмовой дварф', () => {
    const prev = hero2014('fighter', 1, { speciesId: 'dwarf', subspeciesId: 'hill-dwarf' });
    const hp = card(deckOf(prev, undefined, contentFor('2014')).cards, 'hp')!.hp!;
    expect(hp.breakdown).toContainEqual({ kind: 'bonus', sourceId: 'dwarven-toughness', value: 1 });
  });
});

describe('hpGain', () => {
  test('бросок и свой кубик: в пределах 1…кость; среднее — как в правилах', () => {
    const base = { die: 8, conMod: 2, perLevelBonuses: [], retroactiveConDelta: 0, levelsBefore: 5 };
    expect(hpGain({ ...base, method: 'average' }).gain).toBe(7);
    expect(hpGain({ ...base, method: 'roll', rolled: 6 }).gain).toBe(8);
    expect(hpGain({ ...base, method: 'manual', rolled: 12 }).gain).toBe(10);
    expect(hpGain({ ...base, method: 'roll', rolled: 1 }).breakdown[0]).toEqual({
      kind: 'die',
      method: 'roll',
      die: 8,
      value: 1,
    });
  });

  test('карта хитов с закреплённым броском', () => {
    const prev = irmaAt(5);
    const deck = levelUpDeck(prev, startLevelUp(prev), content, { hp: { method: 'roll', value: 3 } });
    expect(card(deck.cards, 'hp')?.hp).toMatchObject({ gain: 5, maxBefore: 38, maxAfter: 43 });
  });
});

describe('buildDeck', () => {
  test('открытые карты и сделанные выборы; счётчики новинок и выборов', () => {
    const prev = irmaAt(5);
    const next = startLevelUp(prev);
    const deck = levelUpDeck(prev, next, content, { revealed: ['hp', 'choice.expertise'] });
    expect(deck.cards.map((c) => c.state)).toEqual(['done', 'revealed']);
    expect(deck.counts).toEqual({ news: 1, choices: 1 });
    expect(buildDeck([], [], {}).cards).toEqual([]);
  });

  test('главные числа итоговой карточки: хиты первыми, не больше шести', () => {
    const prev = irmaAt(4);
    const rows = keyNumbersPreview(levelSnapshot(prev, content), levelSnapshot(startLevelUp(prev), content), content);
    expect(rows[0]).toEqual({ label: { kind: 'number', key: 'maxHp' }, before: 31, after: 38 });
    // Основное оружие — первая атака листа.
    const main = computeSheet(prev, content).attacks[0].key;
    expect(rows[1].label).toEqual({ kind: 'number', key: 'attack', ref: main });
    expect(rows.length).toBeLessThanOrEqual(6);
  });
});

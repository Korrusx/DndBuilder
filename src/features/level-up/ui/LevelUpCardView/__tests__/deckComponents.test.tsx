// Компоненты экрана «Новое на N-м уровне»: лента колоды и три состояния карты.

import { act } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'test-renderer';

import type { Character } from '@/entities/character';
import { content } from '@/shared/content';

import { levelUpDeck } from '../../../model/deck/levelUpDeck';
import { dragonbornPaladin, irmaAt } from '../../../model/deck/__tests__/fixtures';
import { startLevelUp } from '../../../model/levelup';
import type { LevelUpCard } from '../../../model/types';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { deckProgress } from '../../../lib/deckProgress';
import { DeckHeader } from '../../DeckHeader/DeckHeader';
import { DeckTiles } from '../../DeckTiles/DeckTiles';
import { HpCard } from '../../HpCard/HpCard';
import { LevelUpCardView } from '../LevelUpCardView';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null, MaterialCommunityIcons: () => null }));
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const chain: object = new Proxy(() => chain, { get: () => chain, apply: () => chain });
  const shared = (initial: unknown) => {
    const box = { value: initial, get: () => box.value, set: (next: unknown) => (box.value = next) };
    return box;
  };
  return {
    __esModule: true,
    default: { View },
    FadeIn: chain,
    LinearTransition: chain,
    Easing: chain,
    useSharedValue: shared,
    useAnimatedStyle: (fn: () => unknown) => fn(),
    withTiming: (to: unknown) => to,
    withSequence: (...steps: unknown[]) => steps[steps.length - 1],
  };
});
jest.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn: (...args: unknown[]) => void, ...args: unknown[]) => fn(...args),
}));

type Json = { type: string; props: Record<string, unknown>; children: (Json | string)[] | null };

const nodes = (node: Json | string | null, out: Json[] = []): Json[] => {
  if (node && typeof node !== 'string') {
    out.push(node);
    (node.children ?? []).forEach((child) => nodes(child, out));
  }
  return out;
};
const texts = (node: Json | string | null): string[] =>
  !node ? [] : typeof node === 'string' ? [node] : (node.children ?? []).flatMap(texts);
const flatStyle = (node: Json) =>
  Object.assign({}, ...([node.props.style].flat(Infinity).filter(Boolean) as object[])) as Record<string, unknown>;

async function render(element: ReactElement) {
  const root = createRoot();
  await act(async () => {
    root.render(element);
  });
  return root.container.toJSON() as unknown as Json;
}

const kaelan = (): Character => ({
  ...dragonbornPaladin([{ classId: 'paladin', subclassId: 'oath-of-devotion', level: 4 }]),
  weaponMasteries: ['longsword', 'javelin'],
  preparedSpells: ['bless', 'command', 'cure-wounds', 'detect-magic', 'divine-favor'],
});
const deckOf = (prev: Character, revealed: string[] = []) =>
  levelUpDeck(prev, startLevelUp(prev), content, { revealed });
const fake = (i: number): LevelUpCard => ({
  id: `f${i}`,
  type: 'feature',
  source: { kind: 'class', id: 'fighter' },
  state: 'hidden',
});

describe('DeckTiles', () => {
  test('Ирма 5 → 6: две плитки равными колонками, без прокрутки', async () => {
    const tree = await render(
      <DeckTiles cards={deckOf(irmaAt(5)).cards} current={null} settled={[]} onSelect={jest.fn()} />,
    );
    const all = nodes(tree);
    expect(all.some((node) => node.type === 'RCTScrollView')).toBe(false);
    expect(all.filter((node) => node.props.accessibilityRole === 'button')).toHaveLength(2);
  });

  test('девять карт: лента прокручивается, плитки шириной 52', async () => {
    const cards = Array.from({ length: 9 }, (_, i) => fake(i));
    const all = nodes(await render(<DeckTiles cards={cards} current="f0" settled={[]} onSelect={jest.fn()} />));
    expect(all.some((node) => node.type === 'RCTScrollView' && node.props.horizontal)).toBe(true);
    const tiles = all.filter((node) => node.props.accessibilityRole === 'button');
    expect(tiles).toHaveLength(9);
    expect(tiles.every((tile) => flatStyle(tile).width === 52)).toBe(true);
  });
});

describe('LevelUpCardView', () => {
  const base = {
    animate: false,
    picked: [],
    kept: false,
    settled: true,
    onOpen: jest.fn(),
    onToggle: jest.fn(),
    onChoose: jest.fn(),
    onKeep: jest.fn(),
    onMore: jest.fn(),
  };

  test('закрытая карта — рубашка без названия новинки', async () => {
    const card = deckOf(kaelan()).cards.find((c) => c.id === 'feature.paladin-extra-attack')!;
    const words = texts(await render(<LevelUpCardView {...base} card={card} expanded={false} />)).join(' ');
    expect(words).toContain('НОВОЕ УМЕНИЕ');
    expect(words).toContain('Нажмите, чтобы открыть');
    expect(words).not.toContain('Дополнительная атака');
  });

  test('развёрнутая «Дополнительная атака»: шапка, название, метки', async () => {
    const card = deckOf(kaelan(), ['feature.paladin-extra-attack']).cards.find(
      (c) => c.id === 'feature.paladin-extra-attack',
    )!;
    const words = texts(await render(<LevelUpCardView {...base} card={card} expanded fresh />));
    expect(words).toEqual(
      expect.arrayContaining([
        'НОВОЕ УМЕНИЕ · ПАЛАДИН 5',
        'только что',
        'Дополнительная атака',
        'действие «Атака»',
        '2 атаки',
      ]),
    );
  });

  test('свёрнутая карта: название и сводка', async () => {
    const card = deckOf(kaelan(), ['feature.paladin-extra-attack']).cards.find(
      (c) => c.id === 'feature.paladin-extra-attack',
    )!;
    const words = texts(await render(<LevelUpCardView {...base} card={card} expanded={false} />));
    expect(words).toEqual(['Дополнительная атака', 'паладин 5 · действие «Атака» · 2 атаки']);
  });

  test('магия до выбора — «Выбрать заклинания», после — чип «2 Подмога» и «Изменить»', async () => {
    const card = deckOf(kaelan(), ['magic.paladin']).cards.find((c) => c.id === 'magic.paladin')!;
    const slots = { before: [4], after: [4, 2] };
    const before = texts(
      await render(<LevelUpCardView {...base} card={card} slots={slots} settled={false} expanded />),
    );
    expect(before).toEqual(expect.arrayContaining(['ЯЧЕЙКИ', '2 круг', 'открыт', 'Выбрать заклинания']));
    const after = texts(
      await render(
        <LevelUpCardView
          {...base}
          card={card}
          slots={slots}
          picked={[{ id: 'aid', name: 'Подмога', circle: 2 }]}
          expanded
        />,
      ),
    );
    expect(after).toEqual(expect.arrayContaining(['выбор сделан', '2', 'Подмога', 'Изменить']));
  });

  test('«уменьшение движения»: открытая карта сразу показывает содержимое, без переворота', async () => {
    const hidden = deckOf(kaelan()).cards.find((c) => c.id === 'feature.paladin-extra-attack')!;
    const root = createRoot();
    await act(async () => {
      root.render(<LevelUpCardView {...base} card={hidden} expanded />);
    });
    expect(texts(root.container.toJSON() as unknown as Json)).toContain('Нажмите, чтобы открыть');
    await act(async () => {
      root.render(<LevelUpCardView {...base} card={{ ...hidden, state: 'done' }} expanded />);
    });
    const tree = root.container.toJSON() as unknown as Json;
    expect(texts(tree)).toContain('Дополнительная атака');
    expect(texts(tree)).not.toContain('Нажмите, чтобы открыть');
    const turned = nodes(tree).filter((node) => JSON.stringify(flatStyle(node).transform ?? '').includes('rotateX'));
    expect(turned.every((node) => JSON.stringify(flatStyle(node).transform).includes('"0deg"'))).toBe(true);
  });
});

describe('карта хитов', () => {
  const base = {
    showResult: false,
    canReroll: false,
    ownDice: false,
    onToggle: jest.fn(),
    onRoll: jest.fn(),
    onAverage: jest.fn(),
    onManual: jest.fn(),
  };

  test('Ирма 5 → 6 до броска: развёрнута, кость к8, «Бросить к8», среднее 5, встряхивание', async () => {
    const card = deckOf(irmaAt(5)).cards[0];
    const words = texts(await render(<HpCard {...base} card={card} decided={false} expanded />));
    expect(words).toEqual(
      expect.arrayContaining([
        'ХИТЫ · КОСТЬ К8',
        'первым делом',
        'к8 + 2',
        'Бросить к8',
        'Взять среднее · 5',
        'Ввести свой кубик',
        'или встряхните телефон',
      ]),
    );
  });

  test('«Свои кубики»: первой большой кнопкой — ввод своего броска', async () => {
    const card = deckOf(irmaAt(5)).cards[0];
    const words = texts(await render(<HpCard {...base} card={card} decided={false} expanded ownDice />));
    expect(words.indexOf('Ввести свой кубик')).toBeLessThan(words.indexOf('Бросить к8'));
  });

  test('после броска — строка «✓ Хиты 38 → 46 +8»', async () => {
    const prev = irmaAt(5);
    const deck = levelUpDeck(prev, startLevelUp(prev), content, { hp: { method: 'roll', value: 6 } });
    const hp = deck.cards[0].hp!;
    const words = texts(await render(<HpCard {...base} card={deck.cards[0]} decided expanded={false} />)).join('');
    expect(words).toContain(`Хиты${hp.maxBefore} → ${hp.maxAfter}+8`);
  });

  test('счётчик: «Открыто 1 из 2 · хиты не брошены · выборов 0 из 1»', async () => {
    const deck = deckOf(irmaAt(5), ['hp']);
    const tree = await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <DeckHeader
          level={6}
          title="Новое на 6-м уровне"
          subtitle="Ирма Вейл · плут · полурослик"
          progress={deckProgress(deck, [], false)}
          onBack={jest.fn()}
          onRevealAll={jest.fn()}
        />
      </SafeAreaProvider>,
    );
    const words = texts(tree).join('');
    expect(words).toContain('Открыто 1 из 2');
    expect(words).toContain('хиты не брошены');
    expect(words).toContain('выборов 0 из 1');
  });
});

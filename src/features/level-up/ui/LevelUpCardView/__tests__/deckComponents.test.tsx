// Компоненты экрана «Новое на N-м уровне»: лента колоды и три состояния карты (deck-screen-spec.md).

import { act } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'test-renderer';

import type { Character } from '@/entities/character';
import { content } from '@/shared/content';

import { levelUpDeck } from '../../../model/deck/levelUpDeck';
import { dragonbornPaladin, irmaAt } from '../../../model/deck/__tests__/fixtures';
import { startLevelUp } from '../../../model/levelup';
import type { LevelUpCard } from '../../../model/types';
import { DeckTiles } from '../../DeckTiles/DeckTiles';
import { LevelUpCardView } from '../LevelUpCardView';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const chain: object = new Proxy(() => chain, { get: () => chain, apply: () => chain });
  return { __esModule: true, default: { View }, FadeIn: chain };
});

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
});

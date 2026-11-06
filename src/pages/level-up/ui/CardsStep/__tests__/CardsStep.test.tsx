// Экран «Новое на N-м уровне» целиком: колода Каэлана, нажатия на ленту, рубашку и «Дальше».

import { act } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createRoot } from 'test-renderer';

import type { Character } from '@/entities/character';
import { levelUpDeck, startLevelUp } from '@/features/level-up';
import { dragonbornPaladin } from '@/features/level-up/model/deck/__tests__/fixtures';
import { content } from '@/shared/content';

import { CardsStep } from '../CardsStep';
import type { CardsStepProps } from '../CardsStep.types';

jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('react-native-worklets', () => ({ scheduleOnRN: (fn: () => void) => fn() }));
jest.mock('@shopify/react-native-skia', () => new Proxy({}, { get: () => () => null }));
jest.mock('expo-sensors', () => {
  const sensor = { setUpdateInterval: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) };
  return { DeviceMotion: sensor, Accelerometer: sensor };
});
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));
jest.mock('react-native-reanimated', () => {
  // Фабрика jest.mock не видит импорты файла — только require.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text, View } = require('react-native');
  const chain: object = new Proxy(() => chain, { get: () => chain, apply: () => chain });
  const shared = (initial: unknown) => {
    const box = { value: initial, get: () => box.value, set: (next: unknown) => (box.value = next) };
    return box;
  };
  const api: Record<string, unknown> = {
    __esModule: true,
    default: { View, Text, createAnimatedComponent: (component: unknown) => component },
    createAnimatedComponent: (component: unknown) => component,
    useSharedValue: (initial: unknown) => React.useState(() => shared(initial))[0],
    useDerivedValue: (fn: () => unknown) => ({ get: fn, value: fn() }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    useAnimatedProps: (fn: () => unknown) => fn(),
    useAnimatedReaction: () => undefined,
    useFrameCallback: () => ({ setActive: () => undefined }),
    withTiming: (to: unknown) => to,
    withSpring: (to: unknown) => to,
    withDelay: (_ms: number, animation: unknown) => animation,
    withSequence: (...animations: unknown[]) => animations[animations.length - 1],
    cancelAnimation: () => undefined,
    FadeIn: chain,
    interpolate: (_value: number, _input: number[], output: number[]) => output[0],
  };
  return new Proxy(api, { get: (target, key: string) => (key in target ? target[key] : chain) });
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

/** Нажатие на Pressable: у его View в тесте есть только onClick. */
const press = (node: Json) => (node.props.onClick as (event: object) => void)({ nativeEvent: {} });

const kaelan = (): Character => ({
  ...dragonbornPaladin([{ classId: 'paladin', subclassId: 'oath-of-devotion', level: 4 }]),
  name: 'Каэлан',
  weaponMasteries: ['longsword', 'javelin'],
  preparedSpells: ['bless', 'command', 'cure-wounds', 'detect-magic', 'divine-favor'],
});

function setup(revealed: string[], extra: Partial<CardsStepProps> = {}) {
  const prev = kaelan();
  const deck = levelUpDeck(prev, startLevelUp(prev), content, { revealed });
  const props: CardsStepProps = {
    deck,
    before: deck.before,
    after: deck.after,
    title: 'Новое на 5-м уровне',
    subtitle: 'Каэлан · паладин · драконорождённый',
    hpDecided: true,
    picked: {},
    kept: [],
    settled: [],
    animate: false,
    context: {},
    notes: {},
    onBack: jest.fn(),
    onRollHp: jest.fn(),
    onReveal: jest.fn(),
    onChoose: jest.fn(),
    onKeep: jest.fn(),
    onMore: jest.fn(),
    onNext: jest.fn(),
    ...extra,
  };
  return props;
}

async function render(props: CardsStepProps) {
  const root = createRoot();
  await act(async () => {
    root.render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <CardsStep {...props} />
      </SafeAreaProvider>,
    );
  });
  return () => nodes(root.container.toJSON() as unknown as Json);
}

describe('CardsStep', () => {
  test('в процессе: счётчик, лента, рубашки, неактивная «Дальше» с подсказкой', async () => {
    const props = setup(['hp', 'growth', 'feature.paladin-extra-attack']);
    const all = await render(props);
    const words = texts(all()[0]).join(' | ');
    expect(words).toContain('Новое на 5-м уровне');
    expect(words).toContain('Открыть все');
    expect(words).toContain('выборов 0 из 1');
    expect(words).toContain('Осталось открыть 4 карты и сделать 1 выбор');
    expect(words).toContain('Нажмите, чтобы открыть');

    // Нажатие на неактивную «Дальше» не уводит дальше.
    const next = all().find((node) => node.props.accessibilityHint === 'Осталось открыть 4 карты и сделать 1 выбор')!;
    await act(async () => press(next));
    expect(props.onNext).not.toHaveBeenCalled();

    // Нажатие на плитку закрытой карты открывает её.
    const tile = all().find((node) => node.props.accessibilityLabel === 'Магия, не открыто, нужен выбор')!;
    await act(async () => press(tile));
    expect(props.onReveal).toHaveBeenCalledWith(['magic.paladin']);
  });

  test('«Открыть все» без анимации открывает все закрытые сразу', async () => {
    const props = setup(['hp', 'growth']);
    const all = await render(props);
    const button = all().find(
      (node) => texts(node).join('') === 'Открыть все' && node.props.accessibilityRole === 'button',
    )!;
    await act(async () => press(button));
    expect(props.onReveal).toHaveBeenCalledWith([
      'feature.paladin-extra-attack',
      'feature.paladin-faithful-steed',
      'magic.paladin',
      'species.draconic-flight',
      'species',
    ]);
  });

  test('всё открыто и выбор сделан — «Дальше» активна', async () => {
    const ids = setup([]).deck.cards.map((card) => card.id);
    const prev = kaelan();
    const next = { ...startLevelUp(prev), preparedSpells: [...prev.preparedSpells, 'aid'] };
    const deck = levelUpDeck(prev, next, content, { revealed: ids });
    const props = setup(ids, { deck, before: deck.before, after: deck.after });
    const all = await render(props);
    expect(texts(all()[0]).join(' | ')).toContain('Всё открыто · можно к итогу');
    expect(texts(all()[0]).join(' | ')).not.toContain('Открыть все');
    const button = all().find((node) => node.props.accessibilityHint === 'Всё открыто · можно к итогу')!;
    await act(async () => press(button));
    expect(props.onNext).toHaveBeenCalled();
  });
});

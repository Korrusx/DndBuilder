// Ритуал повышения уровня: пропуск анимации, кнопка мультикласса, звук при «уменьшении движения».

import { act } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createRoot } from 'test-renderer';

import { RitualPhase } from '../RitualPhase';
import type { RitualPhaseProps } from '../RitualPhase.types';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));
jest.mock('@expo/vector-icons', () => ({ Feather: () => null, MaterialCommunityIcons: () => null }));
jest.mock('@/features/roll-dice', () => ({
  useDiceSettings: () => ({ style: 'flat', animation: false, skin: 'classic', table: 'felt', sound: false }),
  DiceTable: () => null,
}));
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

const props = (extra: Partial<RitualPhaseProps> = {}): RitualPhaseProps => ({
  name: 'Ирма Вейл',
  subtitle: 'Плут 5 → 6 · Вор',
  from: 5,
  to: 6,
  counts: 'Вас ждут 2 новинки и 1 выбор',
  capstone: false,
  animate: true,
  playKey: 0,
  multiclass: { note: 'мультикласс · доступно 9 классов', disabled: false },
  onClose: jest.fn(),
  onOpen: jest.fn(),
  onOther: jest.fn(),
  onSound: jest.fn(),
  onCancel: jest.fn(),
  onImpact: jest.fn(),
  ...extra,
});

async function render(p: RitualPhaseProps) {
  const root = createRoot();
  await act(async () => {
    root.render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <RitualPhase {...p} />
      </SafeAreaProvider>,
    );
  });
  return () => nodes(root.container.toJSON() as unknown as Json);
}
/** Нажатие по пустому месту экрана — корневая область ритуала. */
const screen = (all: Json[]) => all.find((node) => node.props.accessible === false && node.props.onClick)!;

describe('RitualPhase', () => {
  let now = 0;
  beforeEach(() => {
    jest.useFakeTimers();
    now = 10_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('нажатие до удара (1550 мс) переводит анимацию на удар, звук — туда же; второй раз — ничего', async () => {
    const p = props();
    const all = await render(p);
    now += 500;
    await act(async () => press(screen(all())));
    expect(p.onSound).toHaveBeenCalledWith(1550);
    now += 300;
    await act(async () => press(screen(all())));
    expect(p.onSound).toHaveBeenCalledTimes(1);
  });

  test('после удара нажатие по пустому месту ничего не делает', async () => {
    const p = props();
    const all = await render(p);
    now += 1600;
    await act(async () => press(screen(all())));
    expect(p.onSound).not.toHaveBeenCalled();
  });

  test('без подходящих классов кнопка мультикласса неактивна и с подписью', async () => {
    const note = 'нет классов по требованиям к характеристикам';
    const all = await render(props({ animate: false, multiclass: { note, disabled: true } }));
    const button = all().find(
      (node) => texts(node).includes('Взять уровень в другом классе') && node.props.accessibilityRole === 'button',
    )!;
    expect(button.props.accessibilityState).toEqual({ disabled: true });
    expect(texts(button)).toContain(note);
  });

  test('«уменьшение движения»: сразу конечное состояние, звук с 1450 мс', async () => {
    const p = props({ animate: false });
    const all = await render(p);
    expect(p.onSound).toHaveBeenCalledWith(1450);
    expect(texts(all()[0])).toEqual(
      expect.arrayContaining(['Ирма Вейл растёт', 'Вас ждут 2 новинки и 1 выбор', 'Открыть новинки']),
    );
  });
});

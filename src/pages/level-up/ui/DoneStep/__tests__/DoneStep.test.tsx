import { act } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createRoot } from 'test-renderer';

import { DoneStep } from '../DoneStep';
import type { DoneStepProps } from '../DoneStep.types';

// Анимации в тесте сразу дают конечное значение: проверяется, с чего экран начинается.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
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
    interpolate: (_value: number, _input: number[], output: number[]) => output[0],
  };
  return new Proxy(api, { get: (target, key: string) => (key in target ? target[key] : chain) });
});
jest.mock('react-native-worklets', () => ({ scheduleOnRN: (fn: () => void) => fn() }));
jest.mock('@shopify/react-native-skia', () => {
  const Stub = () => null;
  return new Proxy(
    { rect: () => ({}), rrect: () => ({}), Skia: {}, ImageFormat: {}, FilterMode: {}, MipmapMode: {} },
    { get: (target, key: string) => (key in target ? target[key as keyof typeof target] : Stub) },
  );
});
jest.mock('expo-sensors', () => {
  const sensor = { setUpdateInterval: jest.fn(), addListener: jest.fn(() => ({ remove: jest.fn() })) };
  return { DeviceMotion: sensor, Accelerometer: sensor };
});
jest.mock('@expo/vector-icons', () => ({ Feather: () => null }));
jest.mock('@/features/level-up/lib/useDeckMotion', () => ({ useDeckMotion: () => false }));

const props: DoneStepProps = {
  name: 'Ирма Вейл',
  letter: 'И',
  subtitle: 'Полурослик · Плут · Вор',
  level: 6,
  stats: [{ label: 'ХИТЫ', value: '46', change: '+8' }],
  unlocked: 'Компетентность: Восприятие и Акробатика',
  next: 'Дальше, на 7-м: Увёртливость, Надёжный талант',
  footer: '06.11.2026',
  accessibilityLabel: 'Карта героя: Ирма Вейл, 6-й уровень.',
  legend: false,
  style: 'amber',
  onStyle: jest.fn(),
  onToSheet: jest.fn(),
  storyTitle: 'Ирма Вейл · 6-й уровень',
};

type Json = { type: string; props: Record<string, unknown>; children: (Json | string)[] | null };

const nodes = (node: Json | string, out: Json[] = []): Json[] => {
  if (typeof node !== 'string') {
    out.push(node);
    (node.children ?? []).forEach((child) => nodes(child, out));
  }
  return out;
};
const flatStyle = (node: Json) =>
  Object.assign({}, ...([node.props.style].flat(Infinity).filter(Boolean) as object[])) as Record<string, unknown>;

describe('экран итога при «уменьшении движения»', () => {
  test('сразу конечное состояние: карта на месте, нижний блок виден, без искр и блика', async () => {
    const root = createRoot();
    await act(async () => {
      root.render(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 0, left: 0, right: 0, bottom: 0 },
          }}
        >
          <DoneStep {...props} />
        </SafeAreaProvider>,
      );
    });
    const all = nodes(root.container.toJSON() as unknown as Json);

    const card = all.find((node) => node.props.accessibilityLabel === props.accessibilityLabel)!;
    const wrapper = all.find((node) => nodes(node).includes(card) && Array.isArray(flatStyle(node).transform))!;
    const pose = flatStyle(wrapper);
    expect(pose.opacity).toBe(1);
    expect(pose.transform).toEqual(expect.arrayContaining([{ translateY: 0 }, { scale: 1 }, { rotate: '0deg' }]));

    const bottom = all.find((node) => {
      const style = flatStyle(node);
      return style.opacity === 1 && JSON.stringify(node).includes('К листу') && node !== wrapper;
    });
    expect(bottom).toBeDefined();

    // Искры — маленькие квадраты у карты; при уменьшении движения их нет.
    const sparks = all.filter((node) => {
      const style = flatStyle(node);
      return style.position === 'absolute' && (style.width === 10 || style.width === 8 || style.width === 6);
    });
    expect(sparks).toHaveLength(0);
  });
});

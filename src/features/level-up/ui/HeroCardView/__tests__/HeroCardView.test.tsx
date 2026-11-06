import { act } from 'react';
import { createRoot } from 'test-renderer';

import type { CardStyle } from '../../../config/heroCardThemes';
import { CARD_STYLES, HERO_CARD_THEMES } from '../../../config/heroCardThemes';
import { HeroCardView } from '../HeroCardView';
import type { HeroCardViewProps } from '../HeroCardView.types';

// Декоративные слои рисует Skia (нужен нативный модуль) — в тестах их нет, проверяется разметка карты.
jest.mock('../decor/CardFrame', () => ({ CardFrame: () => null }));
jest.mock('../decor/CardInnerDecor', () => ({ CardInnerDecor: () => null }));
jest.mock('../decor/D20Divider', () => ({ D20Divider: () => null }));
jest.mock('../decor/PortraitRing', () => ({ PortraitRing: () => null }));

const props = (style: CardStyle): HeroCardViewProps => ({
  theme: HERO_CARD_THEMES[style],
  size: 'full',
  width: 350,
  name: 'Ирма Вейл',
  letter: 'И',
  subtitle: 'Полурослик · Плут · Вор',
  level: 6,
  stats: [
    { label: 'ХИТЫ', value: '46', change: '+8' },
    { label: 'ВОСПРИЯТИЕ', value: '+7', change: '+3' },
    { label: 'КЗ', value: '15', change: null },
  ],
  unlocked: 'Компетентность: Восприятие и Акробатика',
  next: 'Дальше, на 7-м: Увёртливость, Надёжный талант',
  footer: 'Тени Солёной Гавани · сессия 12 · 06.11.2026',
  accessibilityLabel: 'Карта героя: Ирма Вейл, 6-й уровень.',
});

type Json = { type: string; props: Record<string, unknown>; children: (Json | string)[] | null };

async function render(element: React.ReactElement) {
  const root = createRoot();
  await act(async () => {
    root.render(element);
  });
  return root.container.toJSON() as unknown as Json;
}

/** Все цвета в стилях разметки (color, backgroundColor, borderColor, boxShadow…). */
function colorsOf(node: Json | string | null, out: string[] = []): string[] {
  if (!node || typeof node === 'string') {
    return out;
  }
  const styles = [node.props.style].flat(Infinity).filter(Boolean) as Record<string, unknown>[];
  for (const style of styles) {
    for (const [key, value] of Object.entries(style)) {
      if (typeof value === 'string' && /color|shadow/i.test(key)) {
        out.push(value);
      }
    }
  }
  (node.children ?? []).forEach((child) => colorsOf(child, out));
  return out;
}

function themeValues(style: CardStyle): string[] {
  const walk = (value: unknown): string[] =>
    typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(walk) : [];
  return walk(HERO_CARD_THEMES[style]);
}

describe('карта героя', () => {
  test.each(CARD_STYLES)('стиль «%s»: снимок разметки и только цвета темы', async (style) => {
    const tree = await render(<HeroCardView {...props(style)} />);
    expect(tree).toMatchSnapshot();
    const allowed = themeValues(style);
    for (const color of colorsOf(tree)) {
      // Тень карты — строка из токенов shadow и glow.
      const parts = color.includes('px')
        ? color.split(/,\s*(?=0 )/).map((part) => part.replace(/^(\d+(px)?\s+){3}/, ''))
        : [color];
      for (const part of parts) {
        expect(allowed).toContain(part);
      }
    }
  });

  test('подпись для диктора одна на всю карту; без фото — буква', async () => {
    const tree = await render(<HeroCardView {...props('amber')} />);
    const card = tree.children?.[0] as Json;
    expect(card.props.accessible).toBe(true);
    expect(card.props.accessibilityLabel).toBe('Карта героя: Ирма Вейл, 6-й уровень.');
    expect(JSON.stringify(tree)).toContain('"И"');
  });

  test('компактная карта (сторис): без «Дальше» и без подвала', async () => {
    const tree = JSON.stringify(await render(<HeroCardView {...props('night')} size="compact" width={300} />));
    expect(tree).not.toContain('Дальше, на 7-м');
    expect(tree).not.toContain('Тени Солёной Гавани');
    expect(tree).toContain('Компетентность');
  });
});

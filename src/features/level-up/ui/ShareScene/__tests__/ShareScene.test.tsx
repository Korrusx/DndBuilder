import { act } from 'react';
import { createRoot } from 'test-renderer';

import { ShareScene } from '../ShareScene';
import type { ShareCardData } from '../ShareScene.types';

jest.mock('../../StyleBackdrop/StyleBackdrop', () => ({ StyleBackdrop: () => null }));
jest.mock('../BrandIcon', () => ({ BrandIcon: () => null }));
jest.mock('../../HeroCardView/decor/CardFrame', () => ({ CardFrame: () => null }));
jest.mock('../../HeroCardView/decor/CardInnerDecor', () => ({ CardInnerDecor: () => null }));
jest.mock('../../HeroCardView/decor/D20Divider', () => ({ D20Divider: () => null }));
jest.mock('../../HeroCardView/decor/PortraitRing', () => ({ PortraitRing: () => null }));

const card: ShareCardData = {
  name: 'Ирма Вейл',
  letter: 'И',
  subtitle: 'Полурослик · Плут · Вор',
  level: 6,
  stats: [{ label: 'ХИТЫ', value: '46', change: '+8' }],
  unlocked: 'Компетентность: Восприятие и Акробатика',
  next: 'Дальше, на 7-м: Увёртливость, Надёжный талант',
  footer: '06.11.2026',
  accessibilityLabel: 'Карта героя',
};

async function render(kind: 'post' | 'story') {
  const root = createRoot();
  await act(async () => {
    root.render(
      <ShareScene
        kind={kind}
        style="amber"
        card={card}
        storyTitle="Ирма Вейл · 6-й уровень"
        campaignLine="Тени Солёной Гавани · сессия 12"
        onReady={() => undefined}
      />,
    );
  });
  return root.container.toJSON() as unknown as { children: { props: { style: unknown } }[] };
}

describe('картинки «Поделиться»', () => {
  test('сторис 390 × 693: заголовок без рода, компактная карта без «Дальше», строка кампании', async () => {
    const tree = await render('story');
    expect([tree.children[0].props.style].flat()).toContainEqual(
      expect.objectContaining({ width: 390, height: 693, backgroundColor: expect.any(String) }),
    );
    const text = JSON.stringify(tree);
    expect(text).toContain('Ирма Вейл · 6-й уровень');
    expect(text).not.toContain('достиг');
    expect(text).not.toContain('Дальше, на 7-м');
    expect(text).toContain('Тени Солёной Гавани · сессия 12');
  });

  test('пост 390 × 487,5: полная карта без шапки сторис', async () => {
    const tree = await render('post');
    expect([tree.children[0].props.style].flat()).toContainEqual(
      expect.objectContaining({ width: 390, height: 487.5 }),
    );
    const text = JSON.stringify(tree);
    expect(text).toContain('Дальше, на 7-м');
    expect(text).not.toContain('Ирма Вейл · 6-й уровень');
  });
});

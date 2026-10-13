import type { Character } from '@/entities/character';
import { characterResources, computeSheet, newDraftCharacter } from '@/entities/character';
import { contentFor } from '@/shared/content';

import { featAbilityRule, levelFeatOptions, startLevelUp } from '../levelup';

const content = contentFor('2014');

function make(classId: string, level: number, patch: Partial<Character> = {}): Character {
  return {
    ...newDraftCharacter('t', 'now', '2014'),
    speciesId: 'human',
    backgroundId: 'acolyte',
    baseAbilities: { str: 14, dex: 12, con: 14, int: 14, wis: 10, cha: 10 },
    classes: [{ classId, level }],
    status: { kind: 'ready' },
    ...patch,
  };
}

describe('черты PHB 2014', () => {
  test('41 черта PHB + «Захват» (SRD) + «Увеличение характеристик»', () => {
    expect(content.feats).toHaveLength(43);
  });

  test('прибавки — по редакции: «Захват» 2014 без прибавки, «Атлет» — СИЛ или ЛОВ', () => {
    expect(featAbilityRule('grappler', content)).toBeNull();
    expect(featAbilityRule('grappler', contentFor('2024'))).toMatchObject({ mode: 'one' });
    expect(featAbilityRule('athlete', content)).toEqual({ mode: 'one', abilities: ['str', 'dex'], cap: 20 });
    expect(featAbilityRule('ability-score-improvement', content)).toEqual({ mode: 'asi' });
  });

  test('«Устойчивый»: +1 и владение спасброском', () => {
    const c = make('wizard', 4, { feats: [{ featId: 'resilient', source: 'class', level: 4, abilityIncreases: { con: 1 } }] });
    const sheet = computeSheet(c, content);
    expect(sheet.abilities.con).toMatchObject({ score: 16, saveProficient: true, save: 3 + 2 });
  });

  test('черта человека-варианта: «Устойчивый» к ТЕЛ', () => {
    const c = make('fighter', 1, {
      speciesId: 'human-variant',
      choices: { 'trait.abilityBonus': ['str', 'dex'], 'versatile.feat': ['resilient'], 'versatile.ability': ['con'] },
    });
    expect(computeSheet(c, content).abilities.con).toMatchObject({ score: 15, saveProficient: true });
  });

  test('«Подвижный», «Наблюдательный», «Крепкий»', () => {
    const feats = (featId: string) => [{ featId, source: 'class' as const, level: 4 }];
    const plain = computeSheet(make('fighter', 4), content);
    expect(computeSheet(make('fighter', 4, { feats: feats('mobile') }), content).speed).toBe(plain.speed + 10);
    expect(computeSheet(make('fighter', 4, { feats: feats('observant') }), content).passivePerception).toBe(plain.passivePerception + 5);
    expect(computeSheet(make('fighter', 4, { feats: feats('tough') }), content).maxHp).toBe(plain.maxHp + 8);
  });

  test('«Мастер средних доспехов»: до +3 ЛОВ в среднем доспехе', () => {
    const c = make('fighter', 4, {
      baseAbilities: { str: 14, dex: 16, con: 14, int: 10, wis: 10, cha: 10 },
      equipment: [{ itemId: 'scale-mail', quantity: 1, equipped: true }],
    });
    // Чешуйчатый доспех 14 + ЛОВ 17 (+3), но не больше +2
    expect(computeSheet(c, content).armorClass).toBe(16);
    expect(computeSheet({ ...c, feats: [{ featId: 'medium-armor-master', source: 'class', level: 4 }] }, content).armorClass).toBe(17);
  });

  test('«Тяжёлая броня» даёт владение тяжёлыми доспехами', () => {
    const c = make('cleric', 4, { feats: [{ featId: 'heavily-armored', source: 'class', level: 4, abilityIncreases: { str: 1 } }] });
    expect(computeSheet(c, content).proficiencies).toContain('heavy-armor');
  });

  test('условия черт: владение доспехами, заклинательство, характеристика 13', () => {
    const wizard = levelFeatOptions(startLevelUp(make('wizard', 3)), content, 'asi');
    const fighter = levelFeatOptions(startLevelUp(make('fighter', 3)), content, 'asi');
    expect(wizard).not.toContain('heavily-armored');
    expect(fighter).toContain('heavily-armored');
    expect(wizard).toContain('war-caster');
    expect(fighter).not.toContain('war-caster');
    // ЛОВ 12 + 1 (человек) = 13
    expect(fighter).toContain('defensive-duelist');
    expect(fighter).not.toContain('inspiring-leader');
  });

  test('«Везунчик» — три очка удачи до долгого отдыха', () => {
    const c = make('fighter', 4, { feats: [{ featId: 'lucky', source: 'class', level: 4 }] });
    expect(characterResources(c, content).find((r) => r.id === 'lucky')).toMatchObject({ max: 3, recovery: 'long' });
  });
});

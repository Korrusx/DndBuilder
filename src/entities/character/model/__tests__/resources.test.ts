import { content } from '@/shared/content';
import { irmaLevel1 } from '../../lib/samples';
import { setClass } from '../build';
import { adjustResource, characterResources, shortRestResources } from '../resources';
import { longRest } from '../rest';
import type { Character } from '../types';

/** Ирма с другим классом и уровнем (характеристики Ирмы: ХАР 10, МДР 12). */
const at = (classId: string, level: number, subclassId?: string): Character => ({
  ...setClass(irmaLevel1(), classId),
  classes: [{ classId, level, subclassId }],
});

const byId = (c: Character) => Object.fromEntries(characterResources(c, content).map((r) => [r.id, r]));

describe('ресурсы умений', () => {
  test('Ирма-плут 1: из ресурсов нет ничего', () => {
    expect(characterResources(irmaLevel1(), content)).toEqual([]);
  });

  test('варвар: ярость по таблице класса, одно использование за короткий отдых', () => {
    expect(byId(at('barbarian', 1)).rage).toMatchObject({ max: 2, recovery: 'short-one' });
    expect(byId(at('barbarian', 6)).rage.max).toBe(4);
  });

  test('бард: вдохновение = мод. ХАР (минимум 1), кость по уровню, короткий отдых с 5-го', () => {
    expect(byId(at('bard', 1))['bardic-inspiration']).toMatchObject({ max: 1, die: 6, recovery: 'long' });
    expect(byId(at('bard', 5))['bardic-inspiration']).toMatchObject({ die: 8, recovery: 'short' });
  });

  test('паладин: наложение рук 5 × уровень; божественный канал с 3-го', () => {
    const r = byId(at('paladin', 3));
    expect(r['lay-on-hands'].max).toBe(15);
    expect(r['paladin-channel-divinity']).toMatchObject({ max: 2, recovery: 'short-one' });
    expect(byId(at('paladin', 2))['paladin-channel-divinity']).toBeUndefined();
  });

  test('воин: всплеск действий 2 раза с 17-го, несгибаемость по уровням', () => {
    expect(byId(at('fighter', 2))['action-surge'].max).toBe(1);
    expect(byId(at('fighter', 17))['action-surge'].max).toBe(2);
    expect(byId(at('fighter', 13)).indomitable.max).toBe(2);
  });

  test('подкласс: кости превосходства Мастера боевых искусств растут и крупнеют', () => {
    expect(byId(at('fighter', 3, 'battle-master'))['superiority-dice']).toMatchObject({ max: 4, die: 8, recovery: 'short' });
    expect(byId(at('fighter', 10, 'battle-master'))['superiority-dice']).toMatchObject({ max: 5, die: 10 });
    expect(byId(at('fighter', 3))['superiority-dice']).toBeUndefined();
  });

  test('вид и черта: оружие дыхания и очки удачи = бонус мастерства', () => {
    const dragonborn = { ...at('fighter', 5), speciesId: 'dragonborn', subspeciesId: 'draconic-ancestor-black', size: undefined };
    const r = byId(dragonborn);
    expect(r['breath-weapon'].max).toBe(3);
    expect(r['draconic-flight'].max).toBe(1);
    expect(byId({ ...dragonborn, classes: [{ classId: 'fighter', level: 4 }] })['draconic-flight']).toBeUndefined();
  });

  test('трата, короткий и долгий отдых', () => {
    const c = at('fighter', 9, 'battle-master');
    let state = c.state;
    const res = () => characterResources({ ...c, state }, content);
    const max = (id: string) => res().find((r) => r.id === id)!.max;
    state = adjustResource(state, 'second-wind', 2, max('second-wind'));
    state = adjustResource(state, 'superiority-dice', 9, max('superiority-dice'));
    state = adjustResource(state, 'indomitable', 1, max('indomitable'));
    expect(state.resourcesSpent).toEqual({ 'second-wind': 2, 'superiority-dice': 5, indomitable: 1 });
    expect(adjustResource(state, 'second-wind', -5, 2).resourcesSpent['second-wind']).toBe(0);

    state = shortRestResources(state, res());
    expect(state.resourcesSpent).toEqual({ 'second-wind': 1, 'superiority-dice': 0, indomitable: 1 });
    expect(longRest(state, 40).resourcesSpent).toEqual({});
  });
});

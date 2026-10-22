// Тесты механики эффектов предметов: магический бонус, доп. урон, эффекты надетых предметов.

import type { Equipment, MagicItem } from '@/shared/content';
import { content, indexOf } from '@/shared/content';

import { irmaLevel5 } from '../../lib/samples';
import { armorClass } from '../combat';
import { computeSheet } from '../sheet';

const idx = indexOf(content);

// Ирма на 5-м уровне: ЛОВ 18 (+4), БМ +3, кожаный доспех (КЗ 14 = 12+4+0, нет магии).
// После irmaLevel5(): ЛОВ 15+2(предыстория)+1(АУУ)=18 → мод +4.
// ТЕЛ: 14+1(АУУ)=15 → мод +2. Хиты 38, КЗ 14 без доспеха с нуля или 12+4=16 в кожаном.

// Вспомогательные функции
function sheet(c: ReturnType<typeof irmaLevel5>) {
  return computeSheet(c, content);
}
const attackOf = (s: ReturnType<typeof computeSheet>, id: string) =>
  s.attacks.find((a) => a.itemId === id || a.key === id);

// --- Инъекция тестовых предметов в content (безопасно: читаем только id) ---

/** Создаёт тестовый Equipment с оружием; добавляет в content.equipment, удаляет после теста. */
function withTestEquipment(item: Equipment, fn: () => void) {
  content.equipment.push(item);
  (idx.equipment as Map<string, Equipment>).set(item.id, item);
  try {
    fn();
  } finally {
    content.equipment.splice(content.equipment.indexOf(item), 1);
    (idx.equipment as Map<string, Equipment>).delete(item.id);
  }
}

function withTestMagicItem(item: MagicItem, fn: () => void) {
  content.magicItems.push(item);
  (idx.magicItems as Map<string, MagicItem>).set(item.id, item);
  try {
    fn();
  } finally {
    content.magicItems.splice(content.magicItems.indexOf(item), 1);
    (idx.magicItems as Map<string, MagicItem>).delete(item.id);
  }
}

// ---- 1. Пламенный клинок ----
// Основа: кинжал (1к4 кол., фехтовальное) — Ирма владеет простым оружием по категории.
// ЛОВ +4, БМ +3, магия +1. Атака: +4+3+1 = +8. Урон: 1к4+5 (кол.) + 1к6 (огнём).
describe('Пламенный клинок (+1, 1к6 огнём)', () => {
  const daggerBase = idx.equipment.get('dagger');
  if (!daggerBase?.weapon) {
    throw new Error('dagger не найден в контенте');
  }

  const flamingSword: Equipment = {
    ...daggerBase,
    id: 'test-flaming-sword',
    magicBonus: 1,
    additionalDamage: [{ dice: '1d6', type: 'fire' }],
  };

  test('атака +8 (ЛОВ +4 + БМ +3 + магия +1)', () => {
    withTestEquipment(flamingSword, () => {
      const s = sheet({ ...irmaLevel5(), equippedSlots: { main: 'test-flaming-sword' } });
      const a = attackOf(s, 'test-flaming-sword');
      expect(a).toBeDefined();
      expect(a!.toHit).toBe(8);
    });
  });

  test('урон 1к4+5 (ЛОВ +4 + магия +1), дополнительный урон 1к6 огнём', () => {
    withTestEquipment(flamingSword, () => {
      const s = sheet({ ...irmaLevel5(), equippedSlots: { main: 'test-flaming-sword' } });
      const a = attackOf(s, 'test-flaming-sword');
      expect(a!.damageDice).toBe('1d4');
      expect(a!.damageBonus).toBe(5);
      expect(a!.additionalDamage).toEqual([{ dice: '1d6', type: 'fire' }]);
    });
  });
});

// ---- 2. Хоумбрю лёгкий доспех +1 + кольцо защиты ----
// Хоумбрю лёгкий доспех: база 12, ЛОВ +4, магия +1 → 17.
// Кольцо защиты: эффект acBonus +1 → итого 18.
describe('Хоумбрю лёгкий доспех +1 + кольцо защиты (+1)', () => {
  const lightArmorPlus1: Equipment = {
    id: 'test-light-armor-plus1',
    name: { en: 'Light Armor +1', ru: 'Лёгкий доспех +1' },
    categories: ['light-armor'],
    cost: { amount: 0, unit: 'gp' },
    armor: { category: 'light', base: 12, dexBonus: true, strMinimum: 0, stealthDisadvantage: false },
    magicBonus: 1,
  };

  const ringOfProtection: MagicItem = {
    id: 'test-ring-of-protection',
    name: { en: 'Ring of Protection', ru: 'Кольцо защиты' },
    category: 'ring',
    kind: { en: 'Ring', ru: 'Кольцо' },
    rarity: { en: 'Uncommon', ru: 'Необычный' },
    attunement: true,
    description: { en: '+1 AC and saving throws', ru: '+1 к КЗ и СБ' },
    variants: [],
    isVariant: false,
    effects: [
      { type: 'acBonus', value: 1 },
      { type: 'savingThrowBonus', value: 1 },
    ],
  };

  test('КЗ: 12 (база) + 4 (ЛОВ) + 1 (магия доспеха) + 1 (кольцо) = 18', () => {
    withTestEquipment(lightArmorPlus1, () =>
      withTestMagicItem(ringOfProtection, () => {
        const s = sheet({
          ...irmaLevel5(),
          equippedSlots: { body: 'test-light-armor-plus1', ring1: 'test-ring-of-protection' },
        });
        expect(s.armorClass).toBe(18);
      }),
    );
  });

  test('бонус к спасброскам от кольца: +1 ко всем', () => {
    withTestMagicItem(ringOfProtection, () => {
      const s = sheet({
        ...irmaLevel5(),
        equippedSlots: { ring1: 'test-ring-of-protection' },
      });
      // ЛОВ-спасбросок: ЛОВ +4 + БМ +3 (плут владеет) + 1 (кольцо) = +8.
      expect(s.abilities.dex.save).toBe(8);
      // ИНТ-спасбросок: ИНТ +2 + БМ +3 (плут владеет) + 1 (кольцо) = +6.
      expect(s.abilities.int.save).toBe(6);
    });
  });
});

// ---- 3. armorClass: магический бонус брони и щита ----
describe('armorClass: магический бонус', () => {
  const mods = { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 0 };

  test('лёгкий доспех +1: база 11 + ЛОВ 2 + магия 1 = 14', () => {
    const armor = { category: 'light' as const, base: 11, dexBonus: true, strMinimum: 0, stealthDisadvantage: false };
    expect(armorClass({ armor, mods, effects: [], armorMagicBonus: 1 })).toBe(14);
  });

  test('щит +1: база 2 + магия 1 = 3 к стандартному КЗ 12', () => {
    const shield = { category: 'shield' as const, base: 2, dexBonus: false, strMinimum: 0, stealthDisadvantage: false };
    expect(armorClass({ shield, mods, effects: [], shieldMagicBonus: 1 })).toBe(15); // 10+2(ЛОВ)+2(щит)+1(магия щита)
  });
});

// ---- 4. setAbilityScore и abilityBonus ----
describe('эффекты предметов: значения характеристик', () => {
  const glovesOfOgrePower: MagicItem = {
    id: 'test-gauntlets-str',
    name: { en: 'Gauntlets of Ogre Power', ru: 'Перчатки силы огра' },
    category: 'wondrous',
    kind: { en: 'Wondrous Item', ru: 'Чудесный предмет' },
    rarity: { en: 'Uncommon', ru: 'Необычный' },
    attunement: true,
    description: { en: 'STR becomes 19', ru: 'СИЛ становится 19' },
    variants: [],
    isVariant: false,
    effects: [{ type: 'setAbilityScore', ability: 'str', value: 19 }],
  };

  test('setAbilityScore: СИЛ Ирмы 8 → 19 от перчаток (мод. +4 вместо −1)', () => {
    withTestMagicItem(glovesOfOgrePower, () => {
      const s = sheet({ ...irmaLevel5(), equippedSlots: { hands: 'test-gauntlets-str' } });
      expect(s.abilities.str.score).toBe(19);
      expect(s.abilities.str.mod).toBe(4);
    });
  });

  test('setAbilityScore не работает, если СИЛ уже выше 19', () => {
    withTestMagicItem(glovesOfOgrePower, () => {
      const strong = { ...irmaLevel5(), baseAbilities: { ...irmaLevel5().baseAbilities, str: 20 } };
      const s = sheet({ ...strong, equippedSlots: { hands: 'test-gauntlets-str' } });
      expect(s.abilities.str.score).toBe(20);
    });
  });
});

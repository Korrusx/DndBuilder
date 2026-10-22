// Режим игры: спасброски от смерти, истощение, ячейки, сотворение заклинаний, броски урона, вещи.

import type { Content, Edition, Equipment, MagicItem } from '@/shared/content';
import { indexOf } from '@/shared/content';
import { parseDice, rollDie } from '@/shared/lib/dice';

import { CUSTOM_ITEM_PREFIX, EXHAUSTION_MAX } from '../config/constants';
import type { Character, DamageRoll, DeathStatus, GameState, InventoryItem, SlotId } from './types';

// ---------- Истощение ----------

/**
 * Штраф к броскам к20 (проверки, атаки, спасброски). SRD 5.2: −2 за каждый уровень.
 * SRD 5.1 (2014): штрафа нет — вместо него помеха (см. exhaustionEffects2014).
 */
export function exhaustionPenalty(exhaustion: number, edition: Edition = '2024'): number {
  return edition === '2014' ? 0 : -2 * exhaustion;
}

/** Скорость. SRD 5.2: −5 фт за каждый уровень. SRD 5.1: со 2-го уровня вдвое меньше, с 5-го — 0. */
export function speedWithExhaustion(speed: number, exhaustion: number, edition: Edition = '2024'): number {
  if (edition === '2014') {
    return exhaustion >= 5 ? 0 : exhaustion >= 2 ? Math.floor(speed / 2) : speed;
  }
  return Math.max(0, speed - 5 * exhaustion);
}

/** Максимум хитов. SRD 5.1: с 4-го уровня истощения вдвое меньше. В SRD 5.2 не меняется. */
export function maxHpWithExhaustion(maxHp: number, exhaustion: number, edition: Edition = '2024'): number {
  return edition === '2014' && exhaustion >= 4 ? Math.floor(maxHp / 2) : maxHp;
}

/**
 * Эффекты истощения SRD 5.1 (2014), накапливаются: 1 — помеха на проверки характеристик;
 * 2 — скорость вдвое меньше; 3 — помеха на атаки и спасброски; 4 — максимум хитов вдвое меньше; 5 — скорость 0; 6 — смерть.
 */
export function exhaustionEffects2014(exhaustion: number): {
  checkDisadvantage: boolean;
  attackSaveDisadvantage: boolean;
  dead: boolean;
} {
  return { checkDisadvantage: exhaustion >= 1, attackSaveDisadvantage: exhaustion >= 3, dead: exhaustion >= 6 };
}

export function setExhaustion(state: GameState, level: number): GameState {
  return { ...state, exhaustion: Math.max(0, Math.min(EXHAUSTION_MAX, level)) };
}

// ---------- Состояния ----------

export function toggleCondition(state: GameState, conditionId: string): GameState {
  const has = state.conditions.includes(conditionId);
  return {
    ...state,
    conditions: has ? state.conditions.filter((c) => c !== conditionId) : [...state.conditions, conditionId],
  };
}

// ---------- Спасброски от смерти ----------

export function deathStatus(state: GameState): DeathStatus {
  if (state.deathSaves.failures >= 3) {
    return 'dead';
  }
  if (state.currentHp > 0) {
    return 'alive';
  }
  if (state.deathSaves.successes >= 3) {
    return 'stable';
  }
  return 'dying';
}

/**
 * Спасбросок от смерти: итог 10+ — успех, меньше — провал; естественная 1 — два провала;
 * естественная 20 — персонаж приходит в себя с 1 хитом. 3 успеха — стабилен, 3 провала — смерть.
 * `total` — итог с модификаторами (например, штраф истощения), по умолчанию равен выпавшему.
 */
export function deathSave(state: GameState, natural: number, total = natural): GameState {
  if (deathStatus(state) !== 'dying') {
    return state;
  }
  if (natural === 20) {
    return { ...state, currentHp: 1, deathSaves: { successes: 0, failures: 0 } };
  }
  const { successes, failures } = state.deathSaves;
  if (natural === 1) {
    return { ...state, deathSaves: { successes, failures: Math.min(3, failures + 2) } };
  }
  if (total >= 10) {
    return { ...state, deathSaves: { successes: successes + 1, failures } };
  }
  return { ...state, deathSaves: { successes, failures: failures + 1 } };
}

// ---------- Ячейки и заклинания ----------

/** Потратить (+1) или вернуть (−1) ячейку круга `level` (1–9). */
export function adjustSlot(state: GameState, level: number, delta: number, slots: number[]): GameState {
  const i = level - 1;
  const max = slots[i] ?? 0;
  const slotsSpent = [...state.slotsSpent];
  slotsSpent[i] = Math.max(0, Math.min(max, (slotsSpent[i] ?? 0) + delta));
  return { ...state, slotsSpent };
}

/** Потратить (+1) или вернуть (−1) отдельную ячейку «Магии договора» круга `level`. */
export function adjustPactSlot(state: GameState, level: number, delta: number, pactSlots: number[]): GameState {
  const i = level - 1;
  const spent = [...(state.pactSlotsSpent ?? pactSlots.map(() => 0))];
  spent[i] = Math.max(0, Math.min(pactSlots[i] ?? 0, (spent[i] ?? 0) + delta));
  return { ...state, pactSlotsSpent: spent };
}

/** Самый низкий круг ≥ `spellLevel` со свободной ячейкой, или null. */
export function lowestFreeSlot(state: GameState, spellLevel: number, slots: number[]): number | null {
  for (let level = Math.max(1, spellLevel); level <= slots.length; level++) {
    if ((state.slotsSpent[level - 1] ?? 0) < (slots[level - 1] ?? 0)) {
      return level;
    }
  }
  return null;
}

/**
 * Сотворить заклинание: заговор ячейку не тратит; иначе тратится ячейка указанного круга
 * (по умолчанию — самая низкая подходящая). null — свободных ячеек нет.
 */
export function castSpell(
  state: GameState,
  spellLevel: number,
  slots: number[],
  slotLevel?: number,
): { state: GameState; slotLevel: number } | null {
  if (spellLevel === 0) {
    return { state, slotLevel: 0 };
  }
  const level = slotLevel ?? lowestFreeSlot(state, spellLevel, slots);
  if (level === null || level < spellLevel) {
    return null;
  }
  if ((state.slotsSpent[level - 1] ?? 0) >= (slots[level - 1] ?? 0)) {
    return null;
  }
  return { state: adjustSlot(state, level, 1, slots), slotLevel: level };
}

/**
 * Сотворить заклинание ячейкой «Магии договора» (отдельные ячейки мультиклассового колдуна):
 * самый низкий круг ≥ круга заклинания со свободной ячейкой. null — свободных нет.
 */
export function castWithPactSlot(
  state: GameState,
  spellLevel: number,
  pactSlots: number[],
): { state: GameState; slotLevel: number } | null {
  for (let level = Math.max(1, spellLevel); level <= pactSlots.length; level++) {
    if ((state.pactSlotsSpent?.[level - 1] ?? 0) < (pactSlots[level - 1] ?? 0)) {
      return { state: adjustPactSlot(state, level, 1, pactSlots), slotLevel: level };
    }
  }
  return null;
}

/**
 * Короткий отдых завершён: колдун восстанавливает ячейки «Магии договора» — отдельные (`pactSlotsSpent`)
 * всегда, а общие — если они только от договора (`pactMagic`, колдун без других заклинателей).
 */
export function finishShortRest(state: GameState, pactMagic: boolean): GameState {
  // Ярость длится не больше 10 минут — после часа отдыха её уже нет.
  const rested = { ...state, raging: false, pactSlotsSpent: undefined };
  return pactMagic ? { ...rested, slotsSpent: state.slotsSpent.map(() => 0) } : rested;
}

// ---------- Броски урона ----------

/**
 * Бросок урона «1к6+3». При критическом попадании кости бросаются дважды.
 * `minDie` — «Сражение большим оружием»: выпавшие ниже значения считаются за него.
 */
export function rollDamage(
  dice: string,
  bonus: number,
  critical = false,
  rng: () => number = Math.random,
  minDie = 0,
): DamageRoll {
  const { count, sides } = parseDice(dice);
  const rolled = Array.from({ length: critical ? count * 2 : count }, () => Math.max(minDie, rollDie(sides, rng)));
  return { dice: rolled, sides, bonus, total: Math.max(0, rolled.reduce((s, d) => s + d, 0) + bonus) };
}

/** Безоружный удар: попадание СИЛ + БМ, урон 1 + СИЛ (дробящий) + бонус ярости. */
export function unarmedStrike(strMod: number, profBonus: number, rageDamage = 0): { toHit: number; damage: number } {
  return { toHit: strMod + profBonus, damage: Math.max(0, 1 + strMod) + rageDamage };
}

// ---------- Ярость и кара ----------

/** Войти в ярость: тратится одно использование «Ярости». null — использований не осталось. */
export function startRage(state: GameState, max: number): GameState | null {
  if ((state.resourcesSpent.rage ?? 0) >= max) {
    return null;
  }
  return {
    ...state,
    raging: true,
    resourcesSpent: { ...state.resourcesSpent, rage: (state.resourcesSpent.rage ?? 0) + 1 },
  };
}

export function endRage(state: GameState): GameState {
  return { ...state, raging: false };
}

/**
 * «Божественная кара» (SRD 5.2): 2к8 излучением ячейкой 1-го круга, +1к8 за каждый круг выше;
 * ещё +1к8, если цель — исчадие или нежить.
 */
export function divineSmiteDice(slotLevel: number, fiendOrUndead: boolean): string {
  return `${1 + slotLevel + (fiendOrUndead ? 1 : 0)}d8`;
}

// ---------- Вещи ----------

/**
 * Надеть/снять предмет. Доспех может быть надет только один, щит — один:
 * при надевании другой доспех (щит) снимается.
 */
export function toggleEquipped(items: InventoryItem[], index: number, content: Content): InventoryItem[] {
  const equipment = indexOf(content).equipment;
  const kind = (i: InventoryItem) => {
    const armor = equipment.get(i.itemId)?.armor;
    return armor ? (armor.category === 'shield' ? 'shield' : 'armor') : 'other';
  };
  const target = items[index];
  if (!target) {
    return items;
  }
  const on = !target.equipped;
  const targetKind = kind(target);
  return items.map((item, i) => {
    if (i === index) {
      return { ...item, equipped: on };
    }
    if (on && targetKind !== 'other' && item.equipped && kind(item) === targetKind) {
      return { ...item, equipped: false };
    }
    return item;
  });
}

/** Добавляет предмет: если такой уже есть (и это не свой предмет), увеличивает количество. */
export function addToInventory(items: InventoryItem[], item: InventoryItem): InventoryItem[] {
  const i = items.findIndex(
    (x) =>
      x.itemId === item.itemId &&
      (x.magicBonus ?? 0) === (item.magicBonus ?? 0) &&
      !x.itemId.startsWith(CUSTOM_ITEM_PREFIX),
  );
  if (i < 0) {
    return [...items, item];
  }
  return items.map((x, j) => (j === i ? { ...x, quantity: x.quantity + item.quantity } : x));
}

// ---------- Слоты экипировки (новая модель) ----------

/** Определяет, подходит ли предмет для данного слота. */
export function fitsSlot(item: Equipment | MagicItem | undefined, slotId: SlotId): boolean {
  if (!item) {
    return false;
  }
  const eq = item as Equipment;
  const magic = item as MagicItem;
  switch (slotId) {
    case 'main':
      return !!eq.weapon && !eq.weapon.properties?.includes('ammunition');
    case 'off':
      return (
        (!!eq.weapon && !!(eq.weapon.properties?.includes('light') || eq.weapon.properties?.includes('thrown'))) ||
        eq.armor?.category === 'shield'
      );
    case 'ranged':
      return !!eq.weapon && !!eq.weapon.properties?.includes('ammunition');
    case 'body':
      return !!eq.armor && eq.armor.category !== 'shield';
    case 'ring1':
    case 'ring2': {
      const k = magic.kind?.en?.toLowerCase() ?? '';
      return k.includes('ring');
    }
    case 'neck': {
      const k = magic.kind?.en?.toLowerCase() ?? '';
      return k.includes('amulet') || k.includes('necklace') || k.includes('pendant');
    }
    case 'head': {
      const k = magic.kind?.en?.toLowerCase() ?? '';
      return k.includes('helm') || k.includes('hat') || k.includes('crown') || k.includes('headband');
    }
    case 'shoulders': {
      const k = magic.kind?.en?.toLowerCase() ?? '';
      return k.includes('cloak') || k.includes('cape') || k.includes('mantle');
    }
    case 'feet': {
      const k = magic.kind?.en?.toLowerCase() ?? '';
      return k.includes('boot') || k.includes('shoe') || k.includes('sandal');
    }
    case 'hands': {
      const k = magic.kind?.en?.toLowerCase() ?? '';
      return k.includes('glove') || k.includes('gauntlet') || k.includes('bracer');
    }
    case 'wrists': {
      const k = magic.kind?.en?.toLowerCase() ?? '';
      return k.includes('bracer') || k.includes('bracelet') || k.includes('wrist');
    }
    case 'belt': {
      const k = magic.kind?.en?.toLowerCase() ?? '';
      return k.includes('belt') || k.includes('girdle');
    }
    default:
      return false;
  }
}

/**
 * Надевает предмет в слот. Перемещает его из рюкзака (`c.equipment`) в `c.equippedSlots`.
 * Если слот уже занят, старый предмет возвращается в рюкзак.
 */
export function equipToSlot(c: Character, slotId: SlotId, itemId: string): Character {
  const old = c.equippedSlots[slotId];
  // Убираем новый предмет из рюкзака (уменьшаем qty или удаляем)
  const bagAfterTake = c.equipment
    .map((x) => (x.itemId === itemId ? { ...x, quantity: x.quantity - 1 } : x))
    .filter((x) => x.quantity > 0);
  // Возвращаем старый предмет в рюкзак
  const bag = old ? addToInventory(bagAfterTake, { itemId: old, quantity: 1 }) : bagAfterTake;
  return {
    ...c,
    equipment: bag,
    equippedSlots: { ...c.equippedSlots, [slotId]: itemId },
  };
}

/**
 * Снимает предмет со слота, возвращает его в рюкзак.
 */
export function unequipSlot(c: Character, slotId: SlotId): Character {
  const itemId = c.equippedSlots[slotId];
  if (!itemId) {
    return c;
  }
  const { [slotId]: _removed, ...rest } = c.equippedSlots;
  return {
    ...c,
    equipment: addToInventory(c.equipment, { itemId, quantity: 1 }),
    equippedSlots: rest,
  };
}

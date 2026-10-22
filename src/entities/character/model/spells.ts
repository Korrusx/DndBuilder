import type { CharacterClass, Edition, Spell } from '@/shared/content';

import { MULTICLASS_SLOTS_CLASS, SPELLCASTER_PROGRESSION } from '../config/constants';
import type { ClassEntry } from './types';

/** СЛ спасброска от заклинаний = 8 + мод + БМ. */
export function spellSaveDC(mod: number, profBonus: number): number {
  return 8 + mod + profBonus;
}

/** Бонус атаки заклинанием = мод + БМ. */
export function spellAttackBonus(mod: number, profBonus: number): number {
  return mod + profBonus;
}

/** Максимум ячеек по кругам 1–9 из таблицы уровней класса. */
export function spellSlots(cls: CharacterClass, level: number): number[] {
  return cls.levels[level - 1]?.spellcasting?.slots ?? [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

const NO_SLOTS = [0, 0, 0, 0, 0, 0, 0, 0, 0];

/** Классы, у которых на их уровне уже есть заклинательство. */
function activeCasters(entries: ClassEntry[], classes: ReadonlyMap<string, CharacterClass>) {
  return entries
    .map((e) => ({ e, cls: classes.get(e.classId) }))
    .filter(({ e, cls }) => !!cls?.spellcasting && e.level >= cls.spellcasting.fromLevel) as {
    e: ClassEntry;
    cls: CharacterClass;
  }[];
}

/**
 * Общие ячейки персонажа (SRD 5.2 и SRD 5.1, «Multiclassing → Spell Slots»).
 * Один заклинатель — по таблице своего класса. Несколько — по таблице мультикласса: все уровни полных
 * заклинателей + половина уровней паладина и следопыта (2024 — вверх, 2014 — вниз). Колдун в сумму не входит:
 * его ячейки отдельно (см. characterPactSlots); если колдун — единственный заклинатель, его ячейки и есть общие.
 */
export function characterSpellSlots(
  entries: ClassEntry[],
  classes: ReadonlyMap<string, CharacterClass>,
  edition: Edition = '2024',
): number[] {
  const casters = activeCasters(entries, classes);
  const regular = casters.filter(({ cls }) => SPELLCASTER_PROGRESSION[cls.id] !== 'pact');
  if (regular.length === 0) {
    return casters[0] ? spellSlots(casters[0].cls, casters[0].e.level) : NO_SLOTS;
  }
  if (regular.length === 1) {
    return spellSlots(regular[0].cls, regular[0].e.level);
  }
  const half = edition === '2014' ? Math.floor : Math.ceil;
  const total = regular.reduce(
    (sum, { e, cls }) => sum + (SPELLCASTER_PROGRESSION[cls.id] === 'half' ? half(e.level / 2) : e.level),
    0,
  );
  if (total === 0) {
    return NO_SLOTS;
  }
  const table = classes.get(MULTICLASS_SLOTS_CLASS);
  return table ? spellSlots(table, Math.min(20, total)) : NO_SLOTS;
}

/** Ячейки «Магии договора», если они идут отдельно от общих (колдун и ещё один заклинатель); иначе undefined. */
export function characterPactSlots(
  entries: ClassEntry[],
  classes: ReadonlyMap<string, CharacterClass>,
): number[] | undefined {
  const casters = activeCasters(entries, classes);
  const pact = casters.find(({ cls }) => SPELLCASTER_PROGRESSION[cls.id] === 'pact');
  if (!pact || casters.length < 2) {
    return undefined;
  }
  return spellSlots(pact.cls, pact.e.level);
}

/** Число подготовленных заклинаний и заговоров на уровне. */
export function spellsKnown(cls: CharacterClass, level: number): { cantrips: number; prepared: number } {
  const sc = cls.levels[level - 1]?.spellcasting;
  return { cantrips: sc?.cantrips ?? 0, prepared: sc?.prepared ?? 0 };
}

/** Пороги уровня персонажа, на которых растёт урон заговоров (SRD 5.2: «Cantrip Upgrade»). */
const CANTRIP_TIERS = [1, 5, 11, 17];

export type SpellDamage = {
  /** Все кости броска («Волшебная стрела» 3 дротика по 1к4+1 → 3к4 и прибавка 3). */
  dice: string;
  /** Постоянная прибавка, без модификатора характеристики. */
  bonus: number;
  /** + модификатор заклинательной характеристики. */
  addModifier?: boolean;
  /** Лучи «Мистического заряда»: каждый — отдельная атака с этими костями. */
  beams?: number;
  /** Дротики «Волшебной стрелы». */
  count?: number;
  kind?: 'heal' | 'tempHp';
  chosenType?: boolean;
};

/**
 * Урон (или лечение) заклинания для круга ячейки; у заговора — для уровня персонажа.
 * null — в справочнике нет урона или нет данных для этого круга.
 */
export function spellDamage(spell: Spell, characterLevel: number, slotLevel = spell.level): SpellDamage | null {
  const d = spell.damage;
  if (!d) {
    return null;
  }
  const key = spell.level === 0 ? '0' : String(slotLevel);
  const common = {
    ...(d.addModifier ? { addModifier: true } : {}),
    ...(d.kind ? { kind: d.kind } : {}),
    ...(d.chosenType ? { chosenType: true } : {}),
  };
  let dice = d.bySlotLevel?.[key];
  let bonus = d.bonusBySlotLevel?.[key] ?? 0;
  if (spell.level === 0) {
    const tier = CANTRIP_TIERS.filter((l) => l <= characterLevel).length;
    // Кость луча: в данных 2024 — ячейка «0», в 2014 — таблица по уровню персонажа (кость не растёт).
    if (d.beams) {
      dice ??= d.byCharacterLevel?.['1'];
      return dice ? { dice, bonus, beams: tier, ...common } : null;
    }
    dice = d.byCharacterLevel?.[String(CANTRIP_TIERS[tier - 1])] ?? dice;
  }
  if (!dice) {
    return null;
  }
  const count = d.countBySlotLevel?.[key];
  if (count) {
    const [n, die] = dice.split('d');
    return { dice: `${Number(n) * count}d${die}`, bonus: bonus * count, count, ...common };
  }
  return { dice, bonus, ...common };
}

/** Круги, для которых известен урон заклинания: от его круга до `maxSlot`. */
export function spellDamageLevels(spell: Spell, maxSlot: number): number[] {
  if (!spell.damage?.bySlotLevel || spell.level === 0) {
    return [];
  }
  return Object.keys(spell.damage.bySlotLevel)
    .map(Number)
    .filter((l) => l >= spell.level && l <= Math.max(spell.level, maxSlot))
    .sort((a, b) => a - b);
}

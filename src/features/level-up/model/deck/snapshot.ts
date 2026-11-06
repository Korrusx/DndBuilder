// Снимок персонажа для колоды повышения уровня: лист (computeSheet) и то, чего в листе нет, но что растёт
// с уровнем: ресурсы, лимиты заклинаний, урон заговоров и особенностей вида. Чистые функции.

import type { Character } from '@/entities/character';
import {
  bonusHpFromEffects,
  CHOICE_KEYS,
  characterResources,
  classSpellLists,
  computeSheet,
  effectsOf,
  hasSpellbook,
  magicInitiateSlots,
  SPELLCASTER_PROGRESSION,
  speciesSpellcasting,
  spellbookMinimum,
  spellDamage,
  spellLimits,
  subclassSpellIds,
  totalLevel,
} from '@/entities/character';
import type { Content } from '@/shared/content';
import { indexOf } from '@/shared/content';

import type { ColumnValue, LevelSnapshot, PactSlots } from '../types';

/** Значение по таблице {уровень: значение} для наибольшего уровня, не превышающего `level`. */
export function byLevel<T>(table: Record<string, T> | undefined, level: number): T | undefined {
  let best: T | undefined;
  let bestLevel = 0;
  for (const [from, value] of Object.entries(table ?? {})) {
    if (Number(from) <= level && Number(from) >= bestLevel) {
      best = value;
      bestLevel = Number(from);
    }
  }
  return best;
}

/** Столбец таблицы класса в простом виде: число, да/нет или кости «3d6». Остальное (таблицы) не сравниваем. */
function columnValue(value: unknown): ColumnValue | undefined {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (value && typeof value === 'object' && 'dice_count' in value && 'dice_value' in value) {
    return `${String(value.dice_count)}d${String(value.dice_value)}`;
  }
  return undefined;
}

/** Ячейки договора одной строкой: «2 ячейки 3-го круга». */
function pactOf(slots: number[] | undefined): PactSlots | undefined {
  const circle = (slots ?? []).findIndex((n) => n > 0);
  return slots && circle >= 0 ? { count: slots[circle], circle: circle + 1 } : undefined;
}

/**
 * Особенность вида доступна, если её ресурс не требует уровня выше текущего («Полёт дракона» — с 5-го).
 * Так уровень особенности берётся из данных ресурсов, без списка видов в коде.
 */
function traitAvailable(traitId: string, level: number, content: Content): boolean {
  return !content.resources.some((r) => !r.classId && r.features.includes(traitId) && (r.minLevel ?? 0) > level);
}

/** Заговоры персонажа из всех источников: классы, вид, черты «Посвящённый в магию». */
function knownCantrips(c: Character, content: Content, speciesCantrips: string[]): string[] {
  const fromClasses = c.classes.flatMap((e) => classSpellLists(c, content, e.classId).cantrips);
  const fromFeats = magicInitiateSlots(c, content).flatMap(
    ({ slot }) => c.choices[CHOICE_KEYS.featCantrips(slot)] ?? [],
  );
  return [...new Set([...fromClasses, ...speciesCantrips, ...fromFeats])];
}

export function levelSnapshot(c: Character, content: Content): LevelSnapshot {
  const idx = indexOf(content);
  const sheet = computeSheet(c, content);
  const level = totalLevel(c.classes);
  const classLevels = Object.fromEntries(c.classes.map((e) => [e.classId, e.level]));

  const features = sheet.features.filter((f) => f.source !== 'species' || traitAvailable(f.id, level, content));

  const columns: LevelSnapshot['columns'] = {};
  for (const [classId, table] of Object.entries(sheet.classSpecific)) {
    for (const [column, raw] of Object.entries(table)) {
      const value = columnValue(raw);
      if (value !== undefined) {
        (columns[classId] ??= {})[column] = value;
      }
    }
  }

  const casters = c.classes.flatMap((e) => {
    const limits = spellLimits(c, content, e.classId);
    if (!limits) {
      return [];
    }
    const book = e.classId === 'wizard' && hasSpellbook(c) ? { spellbook: spellbookMinimum(c) } : {};
    return [{ classId: e.classId, cantrips: limits.cantrips, prepared: limits.prepared, ...book }];
  });

  // «Магия договора»: у одного колдуна ячейки листа и есть ячейки договора, при мультиклассе — отдельно.
  const pactOnly = !!sheet.spellcasting?.slotsFromPact;
  const hasPact = c.classes.some((e) => SPELLCASTER_PROGRESSION[e.classId] === 'pact');
  const slots = pactOnly ? [] : (sheet.spellcasting?.slots ?? []);
  const pact = hasPact ? pactOf(pactOnly ? sheet.spellcasting?.slots : sheet.pactSlots) : undefined;

  const species = speciesSpellcasting(c, content, sheet);
  const speciesSpells = species?.spells.map((s) => s.spellId) ?? [];
  const speciesCantrips = species?.spells.filter((s) => s.level === 0).map((s) => s.spellId) ?? [];

  const cantripDamage: Record<string, string> = {};
  for (const spellId of knownCantrips(c, content, speciesCantrips)) {
    const spell = idx.spells.get(spellId);
    const damage = spell ? spellDamage(spell, level) : null;
    if (damage) {
      cantripDamage[spellId] = damage.beams ? `${damage.beams}×${damage.dice}` : damage.dice;
    }
  }

  const traitDamage: Record<string, string> = {};
  for (const f of features) {
    const dice = f.source === 'species' ? byLevel(idx.traits.get(f.id)?.damageByLevel, level) : undefined;
    if (dice) {
      traitDamage[f.id] = dice;
    }
  }

  const hpBonuses: Record<string, number> = {};
  for (const f of features) {
    const bonus = bonusHpFromEffects(effectsOf([f.id], content.edition), level, classLevels);
    if (bonus) {
      hpBonuses[f.id] = (hpBonuses[f.id] ?? 0) + bonus;
    }
  }

  const passive = (skillId: string) => 10 + (sheet.skills.find((s) => s.id === skillId)?.bonus ?? 0);

  return {
    level,
    classLevels,
    sheet,
    features,
    resources: characterResources(c, content, sheet).map(({ id, max, die, recovery }) => ({
      id,
      max,
      recovery,
      ...(die ? { die } : {}),
    })),
    columns,
    casters,
    slots,
    ...(pact ? { pact } : {}),
    cantripDamage,
    traitDamage,
    alwaysPrepared: subclassSpellIds(c, content),
    speciesSpells,
    hpBonuses,
    conMod: sheet.abilities.con.mod,
    // Пассивные Проницательность и Анализ в листе не хранятся — нужны для строк «было → стало».
    passives: { insight: passive('insight'), investigation: passive('investigation') },
  };
}

// Разница между персонажем до и после повышения уровня: умения, числа, кости, ресурсы, ячейки, лимиты.
// Работает только со снимками (levelSnapshot), справочник нужен лишь для связи «улучшает».

import type { SourcedId } from '@/entities/character';
import { ABILITY_IDS } from '@/entities/character';
import type { Content } from '@/shared/content';
import { indexOf } from '@/shared/content';

import type { LevelSnapshot, NumberChange, SheetDiff } from '../types';

const sameFeature = (a: SourcedId, b: SourcedId) => a.id === b.id && a.source === b.source;

function changedRecord<T>(before: Record<string, T>, after: Record<string, T>) {
  return Object.keys(after)
    .filter((key) => before[key] !== after[key])
    .map((key) => ({ key, before: before[key], after: after[key] }));
}

function numberChanges(before: LevelSnapshot, after: LevelSnapshot): NumberChange[] {
  const out: NumberChange[] = [];
  const push = (key: NumberChange['key'], was: number | string | undefined, now: number | string, ref?: string) => {
    if (was !== undefined && was !== now) {
      out.push({ key, before: was, after: now, ...(ref ? { ref } : {}) });
    }
  };
  const a = before.sheet;
  const b = after.sheet;
  push('maxHp', a.maxHp, b.maxHp);
  push('profBonus', a.profBonus, b.profBonus);
  push('armorClass', a.armorClass, b.armorClass);
  push('speed', a.speed, b.speed);
  push('initiative', a.initiative, b.initiative);
  push('passivePerception', a.passivePerception, b.passivePerception);
  push('passiveInsight', before.passives.insight, after.passives.insight);
  push('passiveInvestigation', before.passives.investigation, after.passives.investigation);
  for (const ability of ABILITY_IDS) {
    push('ability', a.abilities[ability].score, b.abilities[ability].score, ability);
  }
  for (const ability of ABILITY_IDS) {
    push('save', a.abilities[ability].save, b.abilities[ability].save, ability);
  }
  for (const skill of b.skills) {
    push('skill', a.skills.find((s) => s.id === skill.id)?.bonus, skill.bonus, skill.id);
  }
  for (const attack of b.attacks) {
    const was = a.attacks.find((x) => x.key === attack.key);
    if (!was) {
      continue;
    }
    push('attack', was.toHit, attack.toHit, attack.key);
    push('attackDamage', damageText(was), damageText(attack), attack.key);
  }
  for (const caster of b.spellcastingClasses) {
    const was = a.spellcastingClasses.find((x) => x.classId === caster.classId);
    push('spellSaveDC', was?.saveDC, caster.saveDC, caster.classId);
    push('spellAttack', was?.attackBonus, caster.attackBonus, caster.classId);
  }
  return out;
}

/** Урон атаки одной строкой: «1d6+3». */
export function damageText(attack: { damageDice: string; damageBonus: number }): string {
  const bonus = attack.damageBonus;
  return bonus ? `${attack.damageDice}${bonus > 0 ? '+' : ''}${bonus}` : attack.damageDice;
}

export function diffSheets(before: LevelSnapshot, after: LevelSnapshot, content: Content): SheetDiff {
  const features = indexOf(content).features;
  const fresh = after.features.filter((f) => !before.features.some((g) => sameFeature(f, g)));
  const had = new Set(before.features.map((f) => f.id));
  const upgraded = fresh.flatMap((f) => {
    const from = f.source !== 'species' ? features.get(f.id)?.upgrades : undefined;
    return from && had.has(from) ? [{ ...f, from }] : [];
  });

  const columns: SheetDiff['columns'] = [];
  for (const [classId, table] of Object.entries(after.columns)) {
    for (const { key, before: was, after: now } of changedRecord(before.columns[classId] ?? {}, table)) {
      columns.push({ classId, column: key, ...(was === undefined ? {} : { before: was }), after: now });
    }
  }

  const resources: SheetDiff['resources'] = [];
  for (const r of after.resources) {
    const was = before.resources.find((x) => x.id === r.id);
    const now = { max: r.max, ...(r.die ? { die: r.die } : {}) };
    if (!was) {
      resources.push({ id: r.id, recovery: r.recovery, after: now });
    } else if (was.max !== r.max || was.die !== r.die) {
      resources.push({
        id: r.id,
        recovery: r.recovery,
        before: { max: was.max, ...(was.die ? { die: was.die } : {}) },
        after: now,
      });
    }
  }

  const slots: SheetDiff['slots'] = [];
  for (let i = 0; i < Math.max(before.slots.length, after.slots.length); i++) {
    const was = before.slots[i] ?? 0;
    const now = after.slots[i] ?? 0;
    if (was !== now) {
      slots.push({ circle: i + 1, before: was, after: now });
    }
  }
  const pactChanged =
    after.pact && (before.pact?.count !== after.pact.count || before.pact?.circle !== after.pact.circle);

  const spellLimits: SheetDiff['spellLimits'] = [];
  for (const caster of after.casters) {
    const was = before.casters.find((x) => x.classId === caster.classId);
    for (const limit of ['cantrips', 'prepared', 'spellbook'] as const) {
      const now = caster[limit];
      if (now !== undefined && now !== was?.[limit]) {
        spellLimits.push({
          classId: caster.classId,
          limit,
          ...(was?.[limit] === undefined ? {} : { before: was[limit] }),
          after: now,
        });
      }
    }
  }

  const dice = <K extends string>(field: K, a: Record<string, string>, b: Record<string, string>) =>
    changedRecord(a, b).map(({ key, before: was, after: now }) => ({
      [field]: key,
      ...(was === undefined ? {} : { before: was }),
      after: now,
    })) as ({ [P in K]: string } & { before?: string; after: string })[];

  const hpBonuses = Object.entries(after.hpBonuses)
    .map(([sourceId, value]) => ({ sourceId, value: value - (before.hpBonuses[sourceId] ?? 0) }))
    .filter((b) => b.value !== 0);

  return {
    level: { before: before.level, after: after.level },
    added: fresh.filter((f) => !upgraded.some((u) => sameFeature(u, f))),
    upgraded,
    removed: before.features.filter((f) => !after.features.some((g) => sameFeature(f, g))),
    numbers: numberChanges(before, after),
    columns,
    resources,
    slots,
    ...(pactChanged ? { pact: { ...(before.pact ? { before: before.pact } : {}), after: after.pact! } } : {}),
    spellLimits,
    cantripDamage: dice('spellId', before.cantripDamage, after.cantripDamage),
    traitDamage: dice('traitId', before.traitDamage, after.traitDamage),
    alwaysPrepared: after.alwaysPrepared.filter((id) => !before.alwaysPrepared.includes(id)),
    speciesSpells: after.speciesSpells.filter((id) => !before.speciesSpells.includes(id)),
    hpBonuses,
    conMod: { before: before.conMod, after: after.conMod },
  };
}

/** Пустая ли разница (одинаковые листы). */
export function isEmptyDiff(diff: SheetDiff): boolean {
  return (
    diff.level.before === diff.level.after &&
    [
      diff.added,
      diff.upgraded,
      diff.removed,
      diff.numbers,
      diff.columns,
      diff.resources,
      diff.slots,
      diff.spellLimits,
      diff.cantripDamage,
      diff.traitDamage,
      diff.alwaysPrepared,
      diff.speciesSpells,
      diff.hpBonuses,
    ].every((list) => list.length === 0) &&
    !diff.pact &&
    diff.conMod.before === diff.conMod.after
  );
}

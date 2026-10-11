// Повышение уровня (один класс): что появляется на новом уровне, какие выборы нужно сделать,
// чего не хватает и сколько хитов прибавится. Чистые функции, без React и базы.

import type { AbilityId, Content } from '@/shared/content/types';
import { ABILITY_IDS, type Character, type FeatChoice } from '@/entities/character/model/character';
import { FEAT_FEATURES } from '@/entities/character/model/choices';
import { choiceOptionIds, proficientSkills, spellLimits, weaponMasteryCount } from '@/entities/character/model/build';
import { computeSheet, finalAbilityScores, originFeatIds } from '@/entities/character/model/sheet';

export const MAX_LEVEL = 20;

/** Умения, дающие компетентность, и сколько навыков (по тексту SRD 5.2). */
const EXPERTISE_GRANTS: Record<string, number> = {
  'rogue-expertise': 2,
  'bard-expertise': 2,
  'ranger-expertise': 2,
  'ranger-deft-explorer': 1,
  'wizard-scholar': 1,
};

/** Умения, дающие новые языки. */
const LANGUAGE_GRANTS: Record<string, number> = { 'ranger-deft-explorer': 2 };

/** Умения, дающие владение навыками на выбор: из списка класса 1-го уровня или любыми. */
const SKILL_GRANTS: Record<string, { choose: number; from: 'class' | 'any' }> = {
  'barbarian-primal-knowledge': { choose: 1, from: 'class' },
  'lore-bonus-proficiencies': { choose: 3, from: 'any' },
};

/**
 * Прибавки к характеристикам от черт, которые берут на уровне.
 * «Увеличение характеристик»: +2 к одной или +1 к двум. Остальные: +1 к одной из списка.
 * TODO: черта «Посвящённый в магию» на уровне пока не предлагается (нужен выбор заклинаний).
 */
const FEAT_ABILITY: Record<string, { abilities: AbilityId[]; cap: number } | 'asi'> = {
  'ability-score-improvement': 'asi',
  grappler: { abilities: ['str', 'dex'], cap: 20 },
  'boon-of-combat-prowess': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-dimensional-travel': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-fate': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-irresistible-offense': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-spell-recall': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-the-night-spirit': { abilities: ABILITY_IDS, cap: 30 },
  'boon-of-truesight': { abilities: ABILITY_IDS, cap: 30 },
};

export const levelKey = (level: number) => `lvl${level}`;

export type FeatSlotKind = 'asi' | 'epic-boon';

export type LevelUpPlan = {
  classId: string;
  toLevel: number;
  /** Умения класса и подкласса, получаемые на новом уровне. */
  features: { id: string; source: 'class' | 'subclass' }[];
  needsSubclass: boolean;
  featSlot: FeatSlotKind | null;
  expertise: number;
  fightingStyles: number;
  skillChoices: { key: string; featureId: string; choose: number; options: string[] }[];
  languages: number;
};

/** Персонаж на следующем уровне (без новых выборов). */
export function startLevelUp(c: Character): Character {
  const [first, ...rest] = c.classes;
  return { ...c, classes: [{ ...first, level: first.level + 1 }, ...rest] };
}

/** Что появляется на текущем уровне персонажа `next` (уже повышенного). */
export function levelUpPlan(next: Character, content: Content): LevelUpPlan {
  const entry = next.classes[0];
  const cls = content.classes.find((x) => x.id === entry.classId)!;
  const toLevel = entry.level;
  const row = cls.levels[toLevel - 1];
  const classFeatures = row?.features ?? [];

  const firstSubclassLevel = cls.levels.findIndex((r) => r.features.some((id) => id.endsWith('-subclass'))) + 1;
  const subclassFeatures = entry.subclassId
    ? content.features.filter((f) => f.subclassId === entry.subclassId && f.level === toLevel).map((f) => f.id)
    : [];
  // Строки «Подкласс» в таблице класса — заглушки под умения подкласса, их не показываем.
  const features = [
    ...classFeatures.filter((id) => !id.endsWith('-subclass')).map((id) => ({ id, source: 'class' as const })),
    ...subclassFeatures.map((id) => ({ id, source: 'subclass' as const })),
  ];
  const ids = features.map((f) => f.id);
  const sum = (table: Record<string, number>) => ids.reduce((n, id) => n + (table[id] ?? 0), 0);

  const classSkillOptions = choiceOptionIds(cls.proficiencyChoices[0] ?? { choose: 0 }, content);
  const allSkills = content.proficiencies.filter((p) => p.type === 'skill').map((p) => p.id);

  return {
    classId: cls.id,
    toLevel,
    features,
    needsSubclass: toLevel === firstSubclassLevel,
    featSlot: ids.some((id) => id.endsWith('-epic-boon'))
      ? 'epic-boon'
      : ids.some((id) => id.endsWith('-ability-score-improvement'))
        ? 'asi'
        : null,
    expertise: sum(EXPERTISE_GRANTS),
    fightingStyles: ids.filter((id) => FEAT_FEATURES[id]).length,
    skillChoices: ids
      .filter((id) => SKILL_GRANTS[id])
      .map((id) => ({
        key: `${levelKey(toLevel)}.${id}.prof`,
        featureId: id,
        choose: SKILL_GRANTS[id].choose,
        options: SKILL_GRANTS[id].from === 'class' ? classSkillOptions : allSkills,
      })),
    languages: sum(LANGUAGE_GRANTS),
  };
}

/** Черта, взятая на этом уровне за «Увеличение характеристик» / «Эпический дар». */
export function levelFeat(c: Character, content: Content, level: number): FeatChoice | undefined {
  return c.feats.find(
    (f) => f.source === 'class' && f.level === level && content.feats.find((x) => x.id === f.featId)?.type !== 'fighting-style',
  );
}

/** Черты, которые можно взять в слот уровня. */
export function levelFeatOptions(c: Character, content: Content, kind: FeatSlotKind): string[] {
  const level = c.classes[0].level;
  const scores = finalAbilityScores(c);
  const taken = new Set([...originFeatIds(c, content), ...c.feats.filter((f) => f.level !== level).map((f) => f.featId)]);
  return content.feats
    .filter((f) => (kind === 'epic-boon' ? f.type === 'epic-boon' : f.type === 'general' || f.type === 'origin'))
    .filter((f) => f.id !== 'magic-initiate')
    .filter((f) => (f.prerequisites?.minLevel ?? 0) <= level)
    .filter((f) => !taken.has(f.id) || !!f.repeatable)
    .filter((f) => {
      const opts = f.prerequisites?.abilityOptions?.options ?? [];
      return opts.length === 0 || opts.some((o) => o.kind === 'minScore' && scores[o.ability] >= o.min);
    })
    .map((f) => f.id);
}

/** Какие прибавки к характеристикам даёт черта и до какого предела. */
export function featAbilityRule(featId: string): { mode: 'asi' } | { mode: 'one'; abilities: AbilityId[]; cap: number } | null {
  const rule = FEAT_ABILITY[featId];
  if (!rule) return null;
  return rule === 'asi' ? { mode: 'asi' } : { mode: 'one', ...rule };
}

export type LevelUpIssue = { message: string; blocking: boolean };

/** Чего не хватает, чтобы закончить повышение уровня (`prev` — до повышения, `next` — после). */
export function levelUpIssues(next: Character, prev: Character, content: Content): LevelUpIssue[] {
  const plan = levelUpPlan(next, content);
  const issues: LevelUpIssue[] = [];
  const need = (ok: boolean, message: string, blocking = true) => {
    if (!ok) issues.push({ message, blocking });
  };

  if (plan.needsSubclass) need(!!next.classes[0].subclassId, 'Выберите подкласс');

  if (plan.featSlot) {
    const feat = levelFeat(next, content, plan.toLevel);
    need(!!feat, plan.featSlot === 'asi' ? 'Выберите увеличение характеристик или черту' : 'Выберите эпический дар');
    if (feat) {
      const rule = featAbilityRule(feat.featId);
      const inc = Object.values(feat.abilityIncreases ?? {}).filter(Boolean) as number[];
      const total = inc.reduce((a, b) => a + b, 0);
      if (rule?.mode === 'asi') need(total === 2 && inc.every((v) => v <= 2), 'Распределите +2 к характеристикам');
      if (rule?.mode === 'one') need(total === 1 && inc.length === 1, 'Выберите характеристику для +1');
      const featData = content.feats.find((f) => f.id === feat.featId);
      const slots = feat.featId === 'skilled' ? [3] : (featData?.proficiencyChoices ?? []).map((ch) => ch.choose);
      slots.forEach((n, i) => {
        const key = levelFeatProfKey(plan.toLevel, feat.featId, i);
        need((next.choices[key]?.length ?? 0) === n, `Выберите владения черты: ${n}`);
      });
    }
  }

  if (plan.expertise) {
    const skills = proficientSkills(next, content);
    need(
      next.expertise.length === prev.expertise.length + plan.expertise && next.expertise.every((s) => skills.includes(s)),
      `Выберите компетентность: ${plan.expertise}`,
    );
  }

  if (plan.fightingStyles) {
    const count = (c: Character) =>
      c.feats.filter((f) => f.source === 'class' && content.feats.find((x) => x.id === f.featId)?.type === 'fighting-style').length;
    need(count(next) === count(prev) + plan.fightingStyles, 'Выберите боевой стиль');
  }

  for (const sc of plan.skillChoices) {
    need((next.choices[sc.key]?.length ?? 0) === sc.choose, `Выберите навыки: ${sc.choose}`);
  }

  if (plan.languages) {
    need(next.languages.length >= prev.languages.length + plan.languages, `Выберите языки: ${plan.languages}`);
  }

  // Необязательное: новые заклинания и приёмы оружия можно добрать и позже.
  const limits = spellLimits(next, content);
  if (limits) {
    const more = limits.cantrips - next.cantrips.length + (limits.prepared - next.preparedSpells.length);
    need(more <= 0, `Можно выбрать ещё заклинаний: ${more}`, false);
  }
  const masteries = weaponMasteryCount(next, content);
  if (masteries > next.weaponMasteries.length) {
    need(false, `Можно выбрать ещё приёмов оружия: ${masteries - next.weaponMasteries.length}`, false);
  }
  if (plan.features.some((f) => f.id === 'warlock-eldritch-invocations' || f.id.startsWith('sorcerer-metamagic'))) {
    need(false, 'Воззвания и метамагию пока выбирайте вручную и отмечайте в заметках', false);
  }
  return issues;
}

/** Сколько хитов добавит новый уровень (с учётом всех изменений, например +ТЕЛ от черты). */
export function levelUpHpGain(next: Character, prev: Character, content: Content): number {
  return computeSheet(next, content).maxHp - computeSheet(prev, content).maxHp;
}

/** Завершить повышение: текущие хиты растут на столько же, на сколько вырос максимум. */
export function finishLevelUp(next: Character, prev: Character, content: Content): Character {
  const gain = levelUpHpGain(next, prev, content);
  const max = computeSheet(next, content).maxHp;
  return { ...next, state: { ...next.state, currentHp: Math.min(max, next.state.currentHp + Math.max(0, gain)) } };
}

/** Ключ выбора владений черты, взятой на уровне. */
export function levelFeatProfKey(level: number, featId: string, index: number): string {
  return featId === 'skilled' ? `${levelKey(level)}.feat.prof` : `${levelKey(level)}.feat.prof.${index}`;
}

/** Сбросить выборы черты уровня (при смене черты). */
export function clearLevelFeatChoices(c: Character, level: number): Character {
  const prefix = `${levelKey(level)}.feat.`;
  return { ...c, choices: Object.fromEntries(Object.entries(c.choices).filter(([k]) => !k.startsWith(prefix))) };
}


// Повышение уровня (один класс): что появляется на новом уровне, какие выборы нужно сделать,
// чего не хватает и сколько хитов прибавится. Чистые функции, без React и базы.

import type { Character, FeatChoice } from '@/entities/character';
import {
  CHOICE_KEYS,
  choiceOptionIds,
  classOptionProblemTexts,
  classSpellLists,
  FEATURE_OPTIONS,
  featureLanguageSlots,
  computeSheet,
  FEAT_FEATURES,
  hasSpellbook,
  SPELLBOOK_PER_LEVEL,
  spellbook,
  spellbookMinimum,
  totalLevel,
  finalAbilityScores,
  originFeatIds,
  proficientSkills,
  spellLimits,
  subclassLevel,
  weaponMasteryCount,
} from '@/entities/character';
import type { AbilityId, Content } from '@/shared/content';
import { abilityAbbr, indexOf, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n/model';

import { EXPERTISE_GRANTS, FEAT_ABILITY, LANGUAGE_GRANTS, SKILL_GRANTS } from '../config/constants';
import type { FeatSlotKind, LevelUpIssue, LevelUpPlan } from './types';

export const levelKey = (level: number) => `lvl${level}`;

/**
 * Персонаж на следующем уровне (без новых выборов): уровень класса `classId` +1;
 * если такого класса ещё нет — он добавляется 1-м уровнем (мультикласс).
 */
export function startLevelUp(c: Character, classId = c.classes[0].classId): Character {
  if (c.classes.some((e) => e.classId === classId)) {
    return { ...c, classes: c.classes.map((e) => (e.classId === classId ? { ...e, level: e.level + 1 } : e)) };
  }
  return { ...c, classes: [...c.classes, { classId, level: 1 }] };
}

/** Какой класс повышен: уровень вырос или класс новый. */
export function leveledClassId(next: Character, prev: Character): string {
  const before = new Map(prev.classes.map((e) => [e.classId, e.level]));
  return (next.classes.find((e) => e.level > (before.get(e.classId) ?? 0)) ?? next.classes[0]).classId;
}

/** Требования для мультикласса текстом: «СИЛ 13 и ХАР 13», «СИЛ или ЛОВ 13». */
export function multiclassRequirementText(classId: string, content: Content): string {
  const groups = indexOf(content).classes.get(classId)?.multiclass.prerequisites ?? [];
  return groups
    .map((g) => {
      const opts = (g.options ?? []).filter((o) => o.kind === 'minScore');
      const min = opts[0]?.kind === 'minScore' ? opts[0].min : 13;
      return `${opts.map((o) => (o.kind === 'minScore' ? abilityAbbr(o.ability) : '')).join(` ${t('common.or')} `)} ${min}`;
    })
    .join(` ${t('common.and')} `);
}

/**
 * Можно ли взять новый класс (SRD 5.2): 13+ в основной характеристике нового класса и всех текущих.
 * Значения — итоговые (с бонусами предыстории и черт).
 */
export function canMulticlassInto(c: Character, content: Content, classId: string): boolean {
  const classes = indexOf(content).classes;
  const scores = finalAbilityScores(c, content);
  const meets = (id: string) =>
    (classes.get(id)?.multiclass.prerequisites ?? []).every((g) =>
      (g.options ?? []).some((o) => o.kind === 'minScore' && scores[o.ability] >= o.min),
    );
  return meets(classId) && c.classes.every((e) => meets(e.classId));
}

/** Что появляется на текущем уровне класса `classId` персонажа `next` (уже повышенного). */
export function levelUpPlan(next: Character, content: Content, classId = next.classes[0].classId): LevelUpPlan {
  const idx = indexOf(content);
  const entry = next.classes.find((e) => e.classId === classId) ?? next.classes[0];
  const cls = idx.classes.get(entry.classId)!;
  const toLevel = entry.level;
  // Выборы уровня (черта, навыки) помечаются общим уровнем персонажа: у двух классов уровни могут совпадать.
  const charLevel = totalLevel(next.classes);
  const isNewClass = toLevel === 1 && next.classes[0].classId !== cls.id;
  const row = cls.levels[toLevel - 1];
  const classFeatures = row?.features ?? [];

  // 2024: строка «Подкласс» в таблице класса; 2014: уровень первого умения подкласса (жрец — 1, волшебник — 2…).
  const firstSubclassLevel =
    cls.levels.findIndex((r) => r.features.some((id) => id.endsWith('-subclass'))) + 1 || subclassLevel(cls.id, content);
  const subclassFeatures = entry.subclassId
    ? (idx.subclasses.get(entry.subclassId)?.features ?? []).filter((id) => idx.features.get(id)?.level === toLevel)
    : [];
  // Строки «Подкласс» в таблице класса — заглушки под умения подкласса, их не показываем.
  const features = [
    ...classFeatures.filter((id) => !id.endsWith('-subclass')).map((id) => ({ id, source: 'class' as const })),
    ...subclassFeatures.map((id) => ({ id, source: 'subclass' as const })),
  ];
  const ids = features.map((f) => f.id);
  // Таблицы умений 2024 (стиль боя как черта, «Божественный порядок», навыки и языки от умений) — только для 2024:
  // у части умений 2014 те же id («paladin-fighting-style»), но выбор устроен иначе (optionChoices).
  const ids2024 = content.edition === '2014' ? [] : ids;
  const sum = (table: Record<string, number>) => ids2024.reduce((n, id) => n + (table[id] ?? 0), 0);

  const classSkillOptions = choiceOptionIds(cls.proficiencyChoices[0] ?? { choose: 0 }, content);
  const allSkills = content.proficiencies.filter((p) => p.type === 'skill').map((p) => p.id);

  return {
    classId: cls.id,
    toLevel,
    charLevel,
    isNewClass,
    multiclassChoices: isNewClass
      ? cls.multiclass.proficiencyChoices.map((ch, i) => ({
          key: multiclassProfKey(cls.id, i),
          choose: ch.choose,
          desc: ch.desc,
          options: choiceOptionIds(ch, content),
        }))
      : [],
    featureOptions: ids2024.filter((id) => FEATURE_OPTIONS[id]),
    features,
    needsSubclass: toLevel === firstSubclassLevel,
    optionChoices: optionChoices(next, content, cls.id, toLevel, ids),
    featSlot: ids.some((id) => id.endsWith('-epic-boon'))
      ? 'epic-boon'
      : // 2014: «barbarian-ability-score-improvement-1» и т.п.
        ids.some((id) => /-ability-score-improvement(-\d+)?$/.test(id))
        ? 'asi'
        : null,
    // 2014: умения с выбором компетентности («rogue-expertise-2», «bard-expertise-1») — по два навыка.
    expertise: sum(EXPERTISE_GRANTS) + ids.filter((id) => idx.features.get(id)?.expertiseChoice).length * 2,
    fightingStyles: ids2024.filter((id) => FEAT_FEATURES[id]).length,
    skillChoices: ids2024
      .filter((id) => SKILL_GRANTS[id])
      .map((id) => ({
        key: `${levelKey(charLevel)}.${id}.prof`,
        featureId: id,
        choose: SKILL_GRANTS[id].choose,
        options: SKILL_GRANTS[id].from === 'class' ? classSkillOptions : allSkills,
      })),
    languages: sum(LANGUAGE_GRANTS),
  };
}

/**
 * 2014: варианты умений нового уровня. Обычное умение (боевой стиль, договор, метамагия) — выбрать `choose`;
 * воззвания колдуна — всего столько, сколько известно по таблице (столбец invocations_known), если оно выросло.
 */
function optionChoices(next: Character, content: Content, classId: string, toLevel: number, ids: string[]): LevelUpPlan['optionChoices'] {
  const idx = indexOf(content);
  const out: LevelUpPlan['optionChoices'] = ids.flatMap((featureId) => {
    const choice = idx.features.get(featureId)?.optionChoice;
    return choice ? [{ featureId, key: CHOICE_KEYS.featureOption(featureId), total: choice.choose, options: choiceOptionIds(choice, content) }] : [];
  });
  const cls = idx.classes.get(classId);
  const known = (lvl: number) => Number(cls?.levels[lvl - 1]?.classSpecific?.invocations_known ?? 0);
  const invocations = idx.features.get('eldritch-invocations');
  if (invocations?.optionChoice && known(toLevel) > known(toLevel - 1) && !out.some((o) => o.featureId === invocations.id)) {
    out.push({
      featureId: invocations.id,
      key: CHOICE_KEYS.featureOption(invocations.id),
      total: known(toLevel),
      options: choiceOptionIds(invocations.optionChoice, content),
    });
  }
  return out;
}

/** Черта, взятая на этом уровне за «Увеличение характеристик» / «Эпический дар». */
export function levelFeat(c: Character, content: Content, level: number): FeatChoice | undefined {
  return c.feats.find(
    (f) => f.source === 'class' && f.level === level && indexOf(content).feats.get(f.featId)?.type !== 'fighting-style',
  );
}

/** Черты, которые можно взять в слот уровня. */
export function levelFeatOptions(c: Character, content: Content, kind: FeatSlotKind): string[] {
  // Условия черт («4-й уровень+») — по общему уровню; черта этого уровня помечена им же.
  const level = totalLevel(c.classes);
  const scores = finalAbilityScores(c, content);
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

/** Чего не хватает, чтобы закончить повышение уровня (`prev` — до повышения, `next` — после). */
export function levelUpIssues(next: Character, prev: Character, content: Content): LevelUpIssue[] {
  const plan = levelUpPlan(next, content, leveledClassId(next, prev));
  const entry = next.classes.find((e) => e.classId === plan.classId)!;
  const issues: LevelUpIssue[] = [];
  const need = (ok: boolean, message: string, blocking = true, action?: LevelUpIssue['action']) => {
    if (!ok) issues.push({ message, blocking, ...(action ? { action } : {}) });
  };

  if (plan.needsSubclass) need(!!entry.subclassId, t('levelUp.issues.subclass'));

  for (const mc of plan.multiclassChoices) {
    need((next.choices[mc.key]?.length ?? 0) === mc.choose, t('levelUp.issues.multiclassProficiencies', { count: mc.choose }));
  }
  for (const featureId of plan.featureOptions) {
    need(!!next.choices[CHOICE_KEYS.featureOption(featureId)]?.length, t('issues.featureOption'));
  }
  for (const o of plan.optionChoices) {
    need((next.choices[o.key]?.length ?? 0) === o.total, t('issues.featureOption'));
  }
  // Языки от умения, полученного на этом уровне (плут-мультикласс: «Воровской жаргон»).
  const newFeatures = new Set(plan.features.map((f) => f.id));
  for (const slot of featureLanguageSlots(next, content).filter((s) => newFeatures.has(s.featureId))) {
    const left = slot.choose - (next.choices[slot.key]?.length ?? 0);
    need(left <= 0, t('issues.featureLanguages', { feature: nameOf('features', slot.featureId), count: left }));
  }

  if (plan.featSlot) {
    const feat = levelFeat(next, content, plan.charLevel);
    need(!!feat, plan.featSlot === 'asi' ? t('levelUp.issues.asi') : t('levelUp.issues.epicBoon'));
    if (feat) {
      const rule = featAbilityRule(feat.featId);
      const inc = Object.values(feat.abilityIncreases ?? {}).filter(Boolean) as number[];
      const total = inc.reduce((a, b) => a + b, 0);
      if (rule?.mode === 'asi') need(total === 2 && inc.every((v) => v <= 2), t('levelUp.issues.asiSpread'));
      if (rule?.mode === 'one') need(total === 1 && inc.length === 1, t('levelUp.issues.asiOne'));
      const featData = indexOf(content).feats.get(feat.featId);
      const slots = feat.featId === 'skilled' ? [3] : (featData?.proficiencyChoices ?? []).map((ch) => ch.choose);
      slots.forEach((n, i) => {
        const key = levelFeatProfKey(plan.charLevel, feat.featId, i);
        need((next.choices[key]?.length ?? 0) === n, t('levelUp.issues.featProficiencies', { count: n }));
      });
    }
  }

  if (plan.expertise) {
    const skills = proficientSkills(next, content);
    need(
      next.expertise.length === prev.expertise.length + plan.expertise && next.expertise.every((s) => skills.includes(s)),
      t('levelUp.issues.expertise', { count: plan.expertise }),
    );
  }

  if (plan.fightingStyles) {
    const count = (c: Character) =>
      c.feats.filter((f) => f.source === 'class' && indexOf(content).feats.get(f.featId)?.type === 'fighting-style').length;
    need(count(next) === count(prev) + plan.fightingStyles, t('levelUp.issues.fightingStyle'));
  }

  for (const sc of plan.skillChoices) {
    need((next.choices[sc.key]?.length ?? 0) === sc.choose, t('levelUp.issues.skills', { count: sc.choose }));
  }

  if (plan.languages) {
    need(next.languages.length >= prev.languages.length + plan.languages, t('levelUp.issues.languages', { count: plan.languages }));
  }

  // Необязательное: новые заклинания и приёмы оружия можно добрать и позже.
  const limits = spellLimits(next, content, plan.classId);
  if (limits) {
    const lists = classSpellLists(next, content, plan.classId);
    const more = limits.cantrips - lists.cantrips.length + (limits.prepared - lists.preparedSpells.length);
    need(more <= 0, t('levelUp.issues.moreSpells', { count: more }), false, 'spells');
  }
  if (plan.classId === 'wizard') {
    // Новый волшебник — 6 заклинаний в книге, дальше по 2 за уровень.
    const missing = (hasSpellbook(prev) ? spellbook(prev).length + SPELLBOOK_PER_LEVEL : spellbookMinimum(next)) - spellbook(next).length;
    need(missing <= 0, t('levelUp.issues.spellbook', { count: missing }), false, 'spells');
  }
  const masteries = weaponMasteryCount(next, content);
  if (masteries > next.weaponMasteries.length) {
    need(false, t('levelUp.issues.moreMasteries', { count: masteries - next.weaponMasteries.length }), false);
  }
  for (const message of classOptionProblemTexts(next, content)) need(false, message);
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


/** Ключ выбора владений, которые даёт новый класс при мультиклассе (навык плута, инструмент барда…). */
export function multiclassProfKey(classId: string, index: number): string {
  return `mc.${classId}.prof.${index}`;
}

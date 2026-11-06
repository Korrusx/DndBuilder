// Выборы нового уровня по одному: что выбрать, сколько, сделано ли и что мешает закончить повышение.
// Это те же проверки, что раньше жили в levelUpIssues; теперь levelUpIssues — их тексты, а колода — карты.

import type { Character } from '@/entities/character';
import {
  CHOICE_KEYS,
  chosenClassOptions,
  classOptionProblems,
  classOptionProblemText,
  classOptionSlots,
  classSpellLists,
  featureLanguageSlots,
  FEAT_FEATURES,
  hasSpellbook,
  proficientSkills,
  SPELLBOOK_PER_LEVEL,
  spellbook,
  spellbookMinimum,
  spellLimits,
  weaponMasteryCount,
} from '@/entities/character';
import type { Content } from '@/shared/content';
import { indexOf, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';

import { EXPERTISE_GRANTS, LANGUAGE_GRANTS } from '../config/constants';
import { featAbilityRule, leveledClassId, levelFeat, levelFeatProfKey, levelUpPlan } from './levelup';
import type { LevelChoice, LevelUpIssue } from './types';

const ASI_FEATURE = /-(ability-score-improvement(-\d+)?|epic-boon)$/;

/** Выборы уровня в порядке прежнего мастера (`prev` — до повышения, `next` — после, с выборами игрока). */
export function levelChoices(next: Character, prev: Character, content: Content): LevelChoice[] {
  const idx = indexOf(content);
  const classId = leveledClassId(next, prev);
  const plan = levelUpPlan(next, content, classId);
  const entry = next.classes.find((e) => e.classId === plan.classId)!;
  const newIds = plan.features.map((f) => f.id);
  const sourceOf = (featureId?: string): LevelChoice['source'] =>
    plan.isNewClass
      ? 'multiclass'
      : plan.features.find((f) => f.id === featureId)?.source === 'subclass'
        ? 'subclass'
        : 'class';
  const firstNew = (test: (id: string) => boolean) => newIds.find(test);
  const len = (c: Character, key: string) => c.choices[key]?.length ?? 0;

  const out: LevelChoice[] = [];
  const add = (
    choice: Omit<LevelChoice, 'required' | 'blocking' | 'done' | 'source' | 'classId'> &
      Partial<Pick<LevelChoice, 'required' | 'blocking' | 'source'>>,
  ) => {
    const blocking = choice.blocking ?? true;
    out.push({
      ...choice,
      required: choice.required ?? blocking,
      blocking,
      done: choice.problems.length === 0,
      source: choice.source ?? sourceOf(choice.featureId),
      classId: plan.classId,
    });
  };

  if (plan.needsSubclass) {
    add({
      id: 'subclass',
      kind: 'subclass',
      // 2014: строка таблицы «Магическая традиция» — карта этого выбора.
      featureId: firstNew((id) => idx.features.get(id)?.subclassSlot === 'choice'),
      count: 1,
      picked: entry.subclassId ? 1 : 0,
      problems: entry.subclassId ? [] : [t('levelUp.issues.subclass')],
    });
  }

  for (const mc of plan.multiclassChoices) {
    const picked = len(next, mc.key);
    add({
      id: mc.key,
      kind: 'multiclassProficiency',
      key: mc.key,
      count: mc.choose,
      picked,
      source: 'multiclass',
      problems: picked === mc.choose ? [] : [t('levelUp.issues.multiclassProficiencies', { count: mc.choose })],
    });
  }

  for (const featureId of plan.featureOptions) {
    const key = CHOICE_KEYS.featureOption(featureId);
    const picked = len(next, key);
    add({
      id: key,
      kind: 'featureOption',
      key,
      featureId,
      count: 1,
      picked: Math.min(1, picked),
      problems: picked ? [] : [t('issues.featureOption')],
    });
  }

  for (const o of plan.optionChoices) {
    const picked = len(next, o.key);
    const had = len(prev, o.key);
    add({
      id: o.key,
      kind: 'optionChoice',
      key: o.key,
      featureId: o.featureId,
      // Воззвания 2014: на уровне выбирается разница с прежним числом.
      count: Math.max(0, o.total - had),
      picked: Math.max(0, picked - had),
      problems: picked === o.total ? [] : [t('issues.featureOption')],
    });
  }

  // Языки от умения, полученного на этом уровне (плут-мультикласс: «Воровской жаргон»).
  for (const slot of featureLanguageSlots(next, content).filter((s) => newIds.includes(s.featureId))) {
    const left = slot.choose - len(next, slot.key);
    add({
      id: slot.key,
      kind: 'featureLanguages',
      key: slot.key,
      featureId: slot.featureId,
      count: slot.choose,
      picked: len(next, slot.key),
      problems:
        left <= 0 ? [] : [t('issues.featureLanguages', { feature: nameOf('features', slot.featureId), count: left })],
    });
  }

  if (plan.featSlot) {
    const feat = levelFeat(next, content, plan.charLevel);
    const problems: string[] = [];
    if (!feat) {
      problems.push(plan.featSlot === 'asi' ? t('levelUp.issues.asi') : t('levelUp.issues.epicBoon'));
    } else {
      const rule = featAbilityRule(feat.featId, content);
      const inc = Object.values(feat.abilityIncreases ?? {}).filter(Boolean) as number[];
      const total = inc.reduce((a, b) => a + b, 0);
      if (rule?.mode === 'asi' && !(total === 2 && inc.every((v) => v <= 2))) {
        problems.push(t('levelUp.issues.asiSpread'));
      }
      if (rule?.mode === 'one' && !(total === 1 && inc.length === 1)) {
        problems.push(t('levelUp.issues.asiOne'));
      }
      const featData = idx.feats.get(feat.featId);
      const slots = feat.featId === 'skilled' ? [3] : (featData?.proficiencyChoices ?? []).map((ch) => ch.choose);
      slots.forEach((n, i) => {
        if (len(next, levelFeatProfKey(plan.charLevel, feat.featId, i)) !== n) {
          problems.push(t('levelUp.issues.featProficiencies', { count: n }));
        }
      });
    }
    add({
      id: 'feat',
      kind: 'feat',
      featSlot: plan.featSlot,
      featureId: firstNew((id) => ASI_FEATURE.test(id)),
      count: 1,
      picked: feat ? 1 : 0,
      problems,
    });
  }

  if (plan.expertise) {
    const skills = proficientSkills(next, content);
    const picked = next.expertise.length - prev.expertise.length;
    const ok = picked === plan.expertise && next.expertise.every((s) => skills.includes(s));
    add({
      id: 'expertise',
      kind: 'expertise',
      featureId: firstNew((id) => !!EXPERTISE_GRANTS[id] || !!idx.features.get(id)?.expertiseChoice),
      count: plan.expertise,
      picked: Math.max(0, picked),
      problems: ok ? [] : [t('levelUp.issues.expertise', { count: plan.expertise })],
    });
  }

  if (plan.fightingStyles) {
    const count = (c: Character) =>
      c.feats.filter((f) => f.source === 'class' && idx.feats.get(f.featId)?.type === 'fighting-style').length;
    const picked = count(next) - count(prev);
    add({
      id: 'fightingStyle',
      kind: 'fightingStyle',
      featureId: firstNew((id) => !!FEAT_FEATURES[id]),
      count: plan.fightingStyles,
      picked: Math.max(0, picked),
      problems: picked === plan.fightingStyles ? [] : [t('levelUp.issues.fightingStyle')],
    });
  }

  for (const sc of plan.skillChoices) {
    const picked = len(next, sc.key);
    add({
      id: sc.key,
      kind: 'skills',
      key: sc.key,
      featureId: sc.featureId,
      count: sc.choose,
      picked,
      problems: picked === sc.choose ? [] : [t('levelUp.issues.skills', { count: sc.choose })],
    });
  }

  if (plan.languages) {
    const picked = next.languages.length - prev.languages.length;
    add({
      id: 'languages',
      kind: 'languages',
      featureId: firstNew((id) => !!LANGUAGE_GRANTS[id]),
      count: plan.languages,
      picked: Math.max(0, picked),
      problems: picked >= plan.languages ? [] : [t('levelUp.issues.languages', { count: plan.languages })],
    });
  }

  // Новые заклинания и приёмы оружия применить уровень не мешают (их можно добрать позже),
  // но в колоде новые заклинания обязательны: без них карта магии не закрыта.
  const limits = spellLimits(next, content, plan.classId);
  if (limits) {
    const lists = classSpellLists(next, content, plan.classId);
    const was = spellLimits(prev, content, plan.classId);
    // На уровне выбирается прирост лимитов (новый класс-заклинатель — весь лимит).
    const need =
      Math.max(0, limits.cantrips - (was?.cantrips ?? 0)) + Math.max(0, limits.prepared - (was?.prepared ?? 0));
    const more = limits.cantrips - lists.cantrips.length + (limits.prepared - lists.preparedSpells.length);
    if (need > 0 || more > 0) {
      add({
        id: `spells.${plan.classId}`,
        kind: 'spells',
        count: need,
        picked: Math.max(0, need - Math.max(0, more)),
        blocking: false,
        required: true,
        action: 'spells',
        problems: more <= 0 ? [] : [t('levelUp.issues.moreSpells', { count: more })],
      });
    }
  }
  if (plan.classId === 'wizard') {
    // Новый волшебник — 6 заклинаний в книге, дальше по 2 за уровень.
    const target = hasSpellbook(prev) ? spellbook(prev).length + SPELLBOOK_PER_LEVEL : spellbookMinimum(next);
    const missing = target - spellbook(next).length;
    add({
      id: 'spellbook',
      kind: 'spellbook',
      count: target - spellbook(prev).length,
      picked: spellbook(next).length - spellbook(prev).length,
      blocking: false,
      required: true,
      action: 'spells',
      problems: missing <= 0 ? [] : [t('levelUp.issues.spellbook', { count: missing })],
    });
  }

  const masteries = weaponMasteryCount(next, content);
  const grew = masteries - weaponMasteryCount(prev, content);
  if (grew > 0 || masteries > next.weaponMasteries.length) {
    add({
      id: 'masteries',
      kind: 'masteries',
      count: Math.max(0, grew),
      picked: Math.max(0, next.weaponMasteries.length - prev.weaponMasteries.length),
      blocking: false,
      problems:
        masteries > next.weaponMasteries.length
          ? [t('levelUp.issues.moreMasteries', { count: masteries - next.weaponMasteries.length })]
          : [],
    });
  }

  // Воззвания и метамагия (2024): выбрать прибавку к числу, проблемы выбора — в той же карте.
  const problems = classOptionProblems(next, content);
  const optionIdx = idx.classOptions;
  const problemText = (p: (typeof problems)[number]) => classOptionProblemText(p, content);
  const before = new Map(classOptionSlots(prev, content).map((s) => [s.kind, s.count]));
  const shown = new Set<(typeof problems)[number]>();
  for (const slot of classOptionSlots(next, content)) {
    const added = slot.count - (before.get(slot.kind) ?? 0);
    const own = problems.filter(
      (p) =>
        (p.kind === 'count' && p.slot.kind === slot.kind) ||
        (p.kind === 'unmet' && p.ids.some((id) => optionIdx.get(id)?.kind === slot.kind)) ||
        (p.kind === 'tome' && slot.kind === 'invocation'),
    );
    if (added > 0 || own.length) {
      own.forEach((p) => shown.add(p));
      add({
        id: slot.key,
        kind: 'classOption',
        key: slot.key,
        optionKind: slot.kind,
        count: Math.max(0, added),
        picked: Math.max(0, chosenClassOptions(next, slot.kind).length - (before.get(slot.kind) ?? 0)),
        problems: own.map(problemText),
      });
    }
    // SRD 5.2: на каждом уровне своего класса один вариант можно заменить — необязательно.
    if (slot.classId === plan.classId && (before.get(slot.kind) ?? 0) > 0) {
      add({
        id: `${slot.key}.replace`,
        kind: 'replaceOption',
        key: slot.key,
        optionKind: slot.kind,
        count: 1,
        picked: 0,
        blocking: false,
        problems: [],
      });
    }
  }
  const rest = problems.filter((p) => !shown.has(p));
  if (rest.length) {
    add({ id: 'classOptions', kind: 'classOption', count: 0, picked: 0, problems: rest.map(problemText) });
  }
  // Воззвания 2014 (optionChoices): замена одного на уровне колдуна — тоже необязательный выбор.
  for (const o of plan.optionChoices) {
    if (len(prev, o.key) > 0 && o.total > 0 && !out.some((c) => c.id === `${o.key}.replace`)) {
      add({
        id: `${o.key}.replace`,
        kind: 'replaceOption',
        key: o.key,
        featureId: o.featureId,
        count: 1,
        picked: 0,
        blocking: false,
        problems: [],
      });
    }
  }
  return out;
}

/** Чего не хватает, чтобы закончить повышение уровня (`prev` — до повышения, `next` — после). */
export function levelUpIssues(next: Character, prev: Character, content: Content): LevelUpIssue[] {
  return levelChoices(next, prev, content).flatMap((choice) =>
    choice.problems.map((message) => ({
      message,
      blocking: choice.blocking,
      ...(choice.action ? { action: choice.action } : {}),
    })),
  );
}

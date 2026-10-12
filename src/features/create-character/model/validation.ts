import type { Character } from '@/entities/character';
import {
  ABILITY_IDS,
  choice1,
  CHOICE_KEYS,
  classOptionProblemTexts,
  computeSheet,
  equipmentChoice,
  equipmentPicks,
  expertiseCount,
  FEAT_FEATURES,
  featFeatureIds,
  featureLanguageSlots,
  featureName,
  featureOptionIds,
  isStandardArray,
  magicInitiateSlots,
  needsSpeciesSpellAbility,
  originFeats,
  POINT_BUY_BUDGET,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  pointBuySpent,
  proficiencySlots,
  proficientSkills,
  spellLimits,
  STANDARD_LANGUAGE_COUNT,
  startingClass,
  validateBackgroundBonuses,
  weaponMasteryCount,
} from '@/entities/character';
import type { Content } from '@/shared/content';
import { t } from '@/shared/i18n/model';
import { indexOf } from '@/shared/content';

import type { Issue } from './types';

// ---------- Проверка ----------

const count = (xs: string[] | undefined) => xs?.length ?? 0;

/** Чего не хватает в персонаже, по шагам мастера. Пустой список — можно начинать игру. */
export function draftIssues(c: Character, content: Content): Issue[] {
  const issues: Issue[] = [];
  const need = (step: number, ok: boolean, message: string, blocking = true) => {
    if (!ok) issues.push({ step, message, blocking });
  };

  // 1. Класс
  const cls = startingClass(c, content);
  need(1, !!cls, t('issues.noClass'));

  // 2. Предыстория и вид
  const idx = indexOf(content);
  const background = idx.backgrounds.get(c.backgroundId);
  const species = idx.species.get(c.speciesId);
  need(2, !!background, t('issues.noBackground'));
  need(2, !!species, t('issues.noSpecies'));
  if (species) {
    need(2, species.subspecies.length === 0 || !!c.subspeciesId, t('issues.noSubspecies'));
    need(2, !!c.size && species.sizes.includes(c.size), t('issues.noSize'));
  }
  for (const f of originFeats(c, content)) {
    if (f.slot === 'versatile') need(2, !!f.featId, t('issues.noVersatileFeat'));
  }
  if (needsSpeciesSpellAbility(c, content)) need(2, !!choice1(c, CHOICE_KEYS.speciesSpellAbility), t('issues.speciesSpellAbility'));

  // 3. Характеристики
  const base = c.baseAbilities;
  const values = ABILITY_IDS.map((id) => base[id]);
  if (values.some((v) => !v)) need(3, false, t('issues.abilitiesUnassigned'));
  else if (c.abilityMethod === 'standard') need(3, isStandardArray(base), t('issues.notStandardArray'));
  else if (c.abilityMethod === 'pointBuy') {
    const spent = pointBuySpent(base);
    need(3, spent !== undefined && values.every((v) => v >= POINT_BUY_MIN && v <= POINT_BUY_MAX), t('issues.pointBuyRange'));
    need(3, spent === undefined || spent <= POINT_BUY_BUDGET, t('issues.pointBuyOver', { count: POINT_BUY_BUDGET }));
  } else {
    const rolls = [...(c.abilityRolls ?? [])].sort().join(',');
    need(3, rolls === [...values].sort().join(','), t('issues.rollsMismatch'));
  }
  if (background) {
    need(3, validateBackgroundBonuses(c.backgroundBonuses, background.abilities).length === 0, t('issues.backgroundBonuses'));
  }

  // 4. Навыки и владения
  for (const slot of proficiencySlots(c, content)) {
    need(4, count(c.choices[slot.key]) === slot.choose, t('issues.proficiencies', { count: slot.choose, source: t(`issues.source.${slot.source}`) }));
  }
  const exp = expertiseCount(c, content);
  if (exp) {
    const skills = proficientSkills(c, content);
    need(4, c.expertise.length === exp && c.expertise.every((s) => skills.includes(s)), t('issues.expertise', { count: exp }));
  }
  const masteries = weaponMasteryCount(c, content);
  if (masteries) need(4, c.weaponMasteries.length === masteries, t('issues.masteries', { count: masteries }));
  for (const featureId of featureOptionIds(c, content)) {
    need(4, !!choice1(c, CHOICE_KEYS.featureOption(featureId)), t('issues.featureOption'));
  }
  for (const featureId of featFeatureIds(c, content)) {
    need(4, c.feats.some((f) => f.source === 'class' && idx.feats.get(f.featId)?.type === FEAT_FEATURES[featureId]), t('issues.fightingStyle'));
  }
  need(4, c.languages.filter((l) => l !== 'common').length === STANDARD_LANGUAGE_COUNT, t('issues.languages', { count: STANDARD_LANGUAGE_COUNT }));
  for (const slot of featureLanguageSlots(c, content)) {
    const left = slot.choose - count(c.choices[slot.key]);
    need(4, left === 0, t('issues.featureLanguages', { feature: featureName({ id: slot.featureId, source: 'class' }), count: left }));
  }
  for (const message of classOptionProblemTexts(c, content)) need(4, false, message);

  // 5. Снаряжение и заклинания
  for (const source of ['class', 'background'] as const) {
    const choice = equipmentChoice(c, content, source);
    if (!choice) continue;
    const chosen = choice1(c, CHOICE_KEYS.equipment(source));
    const option = chosen === undefined ? undefined : choice.options?.[Number(chosen)];
    need(5, !!option, source === 'class' ? t('issues.classEquipment') : t('issues.backgroundEquipment'));
    for (const pick of equipmentPicks(option, content)) {
      need(5, !!choice1(c, CHOICE_KEYS.equipmentPick(source, pick.index)), t('issues.equipmentPick'));
    }
  }
  const limits = spellLimits(c, content);
  if (limits) {
    need(5, c.cantrips.length === limits.cantrips, t('issues.cantrips', { count: limits.cantrips }));
    need(5, c.preparedSpells.length === limits.prepared, t('issues.spells', { count: limits.prepared }));
  }
  for (const { slot, fixedList } of magicInitiateSlots(c, content)) {
    const ok =
      !!(fixedList ?? choice1(c, CHOICE_KEYS.featSpellList(slot))) &&
      !!choice1(c, CHOICE_KEYS.featAbility(slot)) &&
      count(c.choices[CHOICE_KEYS.featCantrips(slot)]) === 2 &&
      count(c.choices[CHOICE_KEYS.featSpell(slot)]) === 1;
    need(5, ok, t('issues.magicInitiate'));
  }

  // 6. Проверка
  need(6, c.name.trim().length > 0, t('issues.noName'));
  return issues;
}


/** Первый шаг, на котором есть незаполненное (для кнопки «Продолжить»). */
export function firstIncompleteStep(c: Character, content: Content): number {
  const blocking = draftIssues(c, content).filter((i) => i.blocking && i.step < 6);
  return blocking.length ? Math.min(...blocking.map((i) => i.step)) : 6;
}

/** Готовый персонаж: статус «готов», полные хиты. Вызывать только когда нет блокирующих проблем. */
export function finishCharacter(c: Character, content: Content): Character {
  const sheet = computeSheet(c, content);
  return {
    ...c,
    name: c.name.trim(),
    status: { kind: 'ready' },
    state: { ...c.state, currentHp: sheet.maxHp },
  };
}

import { ABILITY_IDS, CHOICE_KEYS, FEAT_FEATURES, POINT_BUY_BUDGET, POINT_BUY_MAX, POINT_BUY_MIN, STANDARD_LANGUAGE_COUNT } from '@/entities/character/config/constants';
import { isStandardArray, pointBuySpent, validateBackgroundBonuses } from '@/entities/character/model/abilities';
import { equipmentChoice, equipmentPicks, expertiseCount, featFeatureIds, featureOptionIds, magicInitiateSlots, originFeats, proficiencySlots, proficientSkills, spellLimits, startingClass, weaponMasteryCount } from '@/entities/character/model/build';
import { choice1 } from '@/entities/character/model/choices';
import { computeSheet } from '@/entities/character/model/sheet';
import type { Character, ProficiencySlot } from '@/entities/character/model/types';
import type { Content } from '@/shared/content/types';
import { findById } from '@/shared/lib/collections';
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
  need(1, !!cls, 'Не выбран класс');

  // 2. Предыстория и вид
  const background = findById(content.backgrounds, c.backgroundId);
  const species = findById(content.species, c.speciesId);
  need(2, !!background, 'Не выбрана предыстория');
  need(2, !!species, 'Не выбран вид');
  if (species) {
    need(2, species.subspecies.length === 0 || !!c.subspeciesId, 'Не выбрано происхождение вида (родословная, предок)');
    need(2, !!c.size && species.sizes.includes(c.size), 'Не выбран размер');
  }
  for (const f of originFeats(c, content)) {
    if (f.slot === 'versatile') need(2, !!f.featId, 'Не выбрана черта происхождения («Универсальность»)');
  }

  // 3. Характеристики
  const base = c.baseAbilities;
  const values = ABILITY_IDS.map((id) => base[id]);
  if (values.some((v) => !v)) need(3, false, 'Не всем характеристикам назначены значения');
  else if (c.abilityMethod === 'standard') need(3, isStandardArray(base), 'Значения не совпадают со стандартным набором');
  else if (c.abilityMethod === 'pointBuy') {
    const spent = pointBuySpent(base);
    need(3, spent !== undefined && values.every((v) => v >= POINT_BUY_MIN && v <= POINT_BUY_MAX), 'Значения вне диапазона 8–15');
    need(3, spent === undefined || spent <= POINT_BUY_BUDGET, `Потрачено больше ${POINT_BUY_BUDGET} очков`);
  } else {
    const rolls = [...(c.abilityRolls ?? [])].sort().join(',');
    need(3, rolls === [...values].sort().join(','), 'Значения не совпадают с результатами бросков');
  }
  if (background) {
    need(3, validateBackgroundBonuses(c.backgroundBonuses, background.abilities).length === 0, 'Не распределены бонусы предыстории');
  }

  // 4. Навыки и владения
  for (const slot of proficiencySlots(c, content)) {
    need(4, count(c.choices[slot.key]) === slot.choose, `Выберите владения: ${slot.choose} (${sourceName(slot.source)})`);
  }
  const exp = expertiseCount(c, content);
  if (exp) {
    const skills = proficientSkills(c, content);
    need(4, c.expertise.length === exp && c.expertise.every((s) => skills.includes(s)), `Выберите компетентность: ${exp} навыка`);
  }
  const masteries = weaponMasteryCount(c, content);
  if (masteries) need(4, c.weaponMasteries.length === masteries, `Выберите приёмы оружия: ${masteries}`);
  for (const featureId of featureOptionIds(c, content)) {
    need(4, !!choice1(c, CHOICE_KEYS.featureOption(featureId)), 'Не выбран вариант умения класса');
  }
  for (const featureId of featFeatureIds(c, content)) {
    need(4, c.feats.some((f) => f.source === 'class' && findById(content.feats, f.featId)?.type === FEAT_FEATURES[featureId]), 'Не выбран боевой стиль');
  }
  need(4, c.languages.filter((l) => l !== 'common').length === STANDARD_LANGUAGE_COUNT, `Выберите языки: ${STANDARD_LANGUAGE_COUNT}`);
  if (cls?.levels[0]?.features.includes('warlock-eldritch-invocations')) {
    need(4, false, 'Таинственные воззвания пока не выбираются в приложении — запишите их в заметки', false);
  }

  // 5. Снаряжение и заклинания
  for (const source of ['class', 'background'] as const) {
    const choice = equipmentChoice(c, content, source);
    if (!choice) continue;
    const chosen = choice1(c, CHOICE_KEYS.equipment(source));
    const option = chosen === undefined ? undefined : choice.options?.[Number(chosen)];
    need(5, !!option, source === 'class' ? 'Не выбрано снаряжение класса' : 'Не выбрано снаряжение предыстории');
    for (const pick of equipmentPicks(option, content)) {
      need(5, !!choice1(c, CHOICE_KEYS.equipmentPick(source, pick.index)), 'Не выбран предмет в наборе снаряжения');
    }
  }
  const limits = spellLimits(c, content);
  if (limits) {
    need(5, c.cantrips.length === limits.cantrips, `Выберите заговоры: ${limits.cantrips}`);
    need(5, c.preparedSpells.length === limits.prepared, `Выберите заклинания 1-го круга: ${limits.prepared}`);
  }
  for (const { slot, fixedList } of magicInitiateSlots(c, content)) {
    const ok =
      !!(fixedList ?? choice1(c, CHOICE_KEYS.featSpellList(slot))) &&
      !!choice1(c, CHOICE_KEYS.featAbility(slot)) &&
      count(c.choices[CHOICE_KEYS.featCantrips(slot)]) === 2 &&
      count(c.choices[CHOICE_KEYS.featSpell(slot)]) === 1;
    need(5, ok, '«Посвящённый в магию»: выберите список, характеристику, 2 заговора и заклинание');
  }

  // 6. Проверка
  need(6, c.name.trim().length > 0, 'Не указано имя');
  return issues;
}

function sourceName(source: ProficiencySlot['source']): string {
  return { class: 'класс', background: 'предыстория', species: 'вид', feat: 'черта' }[source];
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

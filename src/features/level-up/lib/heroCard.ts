// Содержимое карты героя (design/level-up/hero-card-spec.md, раздел 7): медальоны, подзаголовок, «Открыто»,
// «Дальше», подвал, стиль по умолчанию. Чистые функции; тексты — на текущем языке.

import type { Character } from '@/entities/character';
import { classSpellLists, FEATURE_OPTIONS, spellbook, totalLevel } from '@/entities/character';
import type { AbilityId, Content } from '@/shared/content';
import { abilityAbbr, byId, itemName, localizeText, nameOf, proficiencyName } from '@/shared/content';
import { t } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/date';
import { formatModifier, parseDice } from '@/shared/lib/dice';

import { MAX_LEVEL } from '../config/constants';
import type { CardStyle } from '../config/heroCardThemes';
import { NIGHT_CLASSES } from '../config/heroCardThemes';
import { levelFeat, levelUpPlan } from '../model/levelup';
import { keyNumbersPreview, nextLevelPreview } from '../model/deck/previews';
import type { CardRow, CardRowLabel, Deck, LevelChoice, LevelSnapshot } from '../model/types';
import { choiceTitle, rowLabel, rowValue } from './cardText';

/** Медальон карты: подпись прописными, значение и изменение («—», если не изменилось). */
export type CardStat = { label: string; value: string; change: string | null };

const MAX_LABEL = 11;
const STATS = 3;
const DICE = /^\d+d\d+$/;

/** Подпись медальона: прописными, до 11 знаков; длинные — по словарю сокращений. */
export function statLabel(label: CardRowLabel, context: { attacks?: LevelSnapshot['sheet']['attacks'] } = {}): string {
  const short = shortKey(label);
  if (short) {
    const value = t(`heroCard.short.${short}`, {
      defaultValue: '',
      ability: label.kind === 'number' && label.ref ? abilityAbbr(label.ref as AbilityId) : '',
    });
    if (value) {
      return value;
    }
  }
  const full = rowLabel(label, context).toLocaleUpperCase();
  return full.length <= MAX_LABEL ? full : `${full.slice(0, MAX_LABEL - 1).trimEnd()}.`;
}

function shortKey(label: CardRowLabel): string | undefined {
  if (label.kind === 'number') {
    return label.key === 'skill' ? `skill.${label.ref}` : `number.${label.key}`;
  }
  if (label.kind === 'column') {
    return `column.${label.column}`;
  }
  return undefined;
}

/** Изменение: «+8», «−1»; у костей одного размера — «+1к6». */
export function statChange(before: CardRow['before'], after: CardRow['after']): string | null {
  if (typeof before === 'number' && typeof after === 'number') {
    return before === after ? null : formatModifier(after - before);
  }
  if (typeof before === 'string' && typeof after === 'string' && DICE.test(before) && DICE.test(after)) {
    const was = parseDice(before);
    const now = parseDice(after);
    if (was.sides === now.sides && now.count !== was.count) {
      return `${formatModifier(now.count - was.count)}${t('dice.d')}${now.sides}`;
    }
  }
  return null;
}

const toStat = (row: CardRow, context: { attacks?: LevelSnapshot['sheet']['attacks'] }): CardStat => ({
  label: statLabel(row.label, context),
  value: rowValue(row.label, row.after),
  change: row.before === undefined ? null : statChange(row.before, row.after),
});

/**
 * Три медальона: самые важные изменения по приоритету `keyNumbersPreview`, кости таблиц классов
 * («Скрытая атака 4к6») — после ключевых чисел. Если изменений меньше трёх — КЗ, хиты и атака основным
 * оружием без изменения. `skillOrder` — порядок, в котором игрок выбирал навыки (компетентность):
 * навыки одного приоритета идут в этом порядке.
 */
export function pickCardStats(
  before: LevelSnapshot,
  after: LevelSnapshot,
  content: Content,
  skillOrder: string[] = [],
): CardStat[] {
  const context = { attacks: after.sheet.attacks };
  const rank = (row: CardRow) => {
    const index =
      row.label.kind === 'number' && row.label.key === 'skill' ? skillOrder.indexOf(row.label.ref ?? '') : -1;
    return index < 0 ? skillOrder.length : index;
  };
  const numbers = keyNumbersPreview(before, after, content, Number.MAX_SAFE_INTEGER)
    .map((row, i) => ({ row, i }))
    .sort((a, b) => {
      const skills =
        a.row.label.kind === 'number' &&
        b.row.label.kind === 'number' &&
        a.row.label.key === 'skill' &&
        b.row.label.key === 'skill';
      return skills ? rank(a.row) - rank(b.row) || a.i - b.i : a.i - b.i;
    })
    .map(({ row }) => row);
  const dice: CardRow[] = Object.entries(after.columns).flatMap(([classId, table]) =>
    Object.entries(table)
      .filter(([column, value]) => typeof value === 'string' && before.columns[classId]?.[column] !== value)
      .map(([column, value]) => ({
        label: { kind: 'column' as const, classId, column },
        ...(before.columns[classId]?.[column] === undefined ? {} : { before: before.columns[classId][column] }),
        after: value,
      })),
  );
  // Кости — сразу после главных чисел (хиты, атака, СЛ, навыки с компетентностью, пассивное восприятие, КЗ).
  const lead = new Set(['maxHp', 'attack', 'spellSaveDC', 'passivePerception', 'armorClass']);
  const isLead = (row: CardRow) => {
    const label = row.label;
    return (
      label.kind === 'number' &&
      (lead.has(label.key) ||
        (label.key === 'skill' && !!after.sheet.skills.find((s) => s.id === label.ref && s.expertise)))
    );
  };
  const ordered = [...numbers.filter(isLead), ...dice, ...numbers.filter((row) => !isLead(row))];
  const stats = ordered.slice(0, STATS).map((row) => toStat(row, context));

  const used = new Set(ordered.slice(0, STATS).map((row) => JSON.stringify(row.label)));
  const main = after.sheet.attacks[0];
  const fillers: CardRow[] = [
    { label: { kind: 'number', key: 'armorClass' }, after: after.sheet.armorClass },
    { label: { kind: 'number', key: 'maxHp' }, after: after.sheet.maxHp },
    ...(main ? [{ label: { kind: 'number' as const, key: 'attack' as const, ref: main.key }, after: main.toHit }] : []),
  ];
  for (const row of fillers) {
    if (stats.length >= STATS) {
      break;
    }
    const sameKey = [...used].some((key) => {
      const label = JSON.parse(key) as CardRowLabel;
      return label.kind === 'number' && row.label.kind === 'number' && label.key === row.label.key;
    });
    if (!sameKey) {
      stats.push(toStat(row, context));
    }
  }
  return stats;
}

/** «Полурослик · Плут · Вор»; мультикласс — «Полурослик · Плут 5 / Волшебник 1». */
export function cardSubtitle(character: Character): string {
  const classes =
    character.classes.length > 1
      ? [character.classes.map((e) => `${nameOf('classes', e.classId)} ${e.level}`).join(' / ')]
      : character.classes.flatMap((e) => [
          nameOf('classes', e.classId),
          e.subclassId ? localizeText(byId.subclasses.get(e.subclassId)?.name).text : '',
        ]);
  return [nameOf('species', character.speciesId), ...classes].filter(Boolean).join(' · ');
}

/** «А, Б и В». */
export function joinAnd(items: string[]): string {
  if (items.length < 2) {
    return items[0] ?? '';
  }
  return `${items.slice(0, -1).join(', ')} ${t('heroCard.and')} ${items[items.length - 1]}`;
}

const added = (now: string[], was: string[]) => now.filter((id) => !was.includes(id));

/** Что выбрано на уровне: «Компетентность: Восприятие и Акробатика», «Вор», «Меткость». */
function choiceText(choice: LevelChoice, prev: Character, next: Character, content: Content): string {
  const title = choiceTitle(choice);
  const key = choice.key ?? '';
  const list = (names: string[]) => (names.length ? `${title}: ${joinAnd(names)}` : title);
  switch (choice.kind) {
    case 'subclass': {
      const id = next.classes.find((e) => e.classId === choice.classId)?.subclassId;
      return id ? localizeText(byId.subclasses.get(id)?.name).text : title;
    }
    case 'feat': {
      const feat = levelFeat(next, content, levelUpPlan(next, content, choice.classId).charLevel);
      if (!feat) {
        return title;
      }
      if (feat.featId === 'ability-score-improvement') {
        const increases = Object.entries(feat.abilityIncreases ?? {})
          .filter(([, value]) => value)
          .map(([ability, value]) => `${abilityAbbr(ability as AbilityId)} ${formatModifier(value as number)}`);
        return list(increases);
      }
      return nameOf('feats', feat.featId);
    }
    case 'expertise':
      return list(added(next.expertise, prev.expertise).map((id) => nameOf('skills', id)));
    case 'fightingStyle':
      return (
        joinAnd(
          added(
            next.feats.map((f) => f.featId),
            prev.feats.map((f) => f.featId),
          ).map((id) => nameOf('feats', id)),
        ) || title
      );
    case 'skills':
    case 'multiclassProficiency':
      return list(added(next.choices[key] ?? [], prev.choices[key] ?? []).map(proficiencyName));
    case 'languages':
      return list(added(next.languages, prev.languages).map((id) => nameOf('languages', id)));
    case 'featureLanguages':
      return list(added(next.choices[key] ?? [], prev.choices[key] ?? []).map((id) => nameOf('languages', id)));
    case 'masteries':
      return list(added(next.weaponMasteries, prev.weaponMasteries).map((id) => itemName({ itemId: id })));
    case 'classOption':
    case 'replaceOption':
      return list(
        added(next.choices[key] ?? [], prev.choices[key] ?? []).map(
          (id) => localizeText(byId.classOptions.get(id)?.name).text || nameOf('features', id),
        ),
      );
    case 'featureOption': {
      const chosen = (next.choices[key] ?? [])[0];
      const option = choice.featureId ? FEATURE_OPTIONS[choice.featureId]?.find((o) => o.id === chosen) : undefined;
      return option ? localizeText(option.name).text : title;
    }
    case 'optionChoice':
      return list(added(next.choices[key] ?? [], prev.choices[key] ?? []).map((id) => nameOf('features', id)));
    case 'spells': {
      const was = classSpellLists(prev, content, choice.classId);
      const now = classSpellLists(next, content, choice.classId);
      const ids = [...added(now.cantrips, was.cantrips), ...added(now.preparedSpells, was.preparedSpells)];
      return list(ids.map((id) => localizeText(byId.spells.get(id)?.name).text || id));
    }
    case 'spellbook':
      return list(
        added(spellbook(next), spellbook(prev)).map((id) => localizeText(byId.spells.get(id)?.name).text || id),
      );
  }
}

/**
 * «Открыто на этом уровне»: новые умения и сделанные выборы через запятую. Карта-выбор от нового умения
 * («Компетентность») пишется выбором. На 20-м уровне — название умения вершины.
 */
export function cardUnlocked(deck: Deck, prev: Character, next: Character, content: Content): string {
  const capstones = deck.cards.filter((card) => card.type === 'capstone' && card.ref);
  if (capstones.length) {
    return capstones.map((card) => nameOf('features', card.ref!.id)).join(', ');
  }
  const parts: string[] = [];
  for (const card of deck.cards) {
    if (card.choice && (card.choice.picked > 0 || card.choice.kind === 'subclass' || card.choice.kind === 'feat')) {
      if (card.choice.done || card.choice.picked > 0) {
        parts.push(choiceText(card.choice, prev, next, content));
      }
      continue;
    }
    if (card.type === 'multiclass') {
      parts.push(t('levelUpDeck.classLevel', { className: nameOf('classes', card.source.id), level: 1 }));
    } else if ((card.type === 'feature' || card.type === 'species') && card.ref && card.ref.table !== 'species') {
      parts.push(nameOf(card.ref.table, card.ref.id));
    }
  }
  return [...new Set(parts.filter(Boolean))].join(', ');
}

/** «Дальше, на 7-м: Увёртливость, Надёжный талант»; на 20-м уровне — null. */
export function cardNext(next: Character, content: Content, classId: string): string | null {
  const level = totalLevel(next.classes);
  if (level >= MAX_LEVEL) {
    return null;
  }
  const items = nextLevelPreview(next, content, classId);
  const features = items.flatMap((item) =>
    item.kind === 'feature' ? [nameOf(item.source === 'species' ? 'traits' : 'features', item.id)] : [],
  );
  const names = features.length
    ? features
    : items.flatMap((item) =>
        item.kind === 'row' ? [`${rowLabel(item.row.label)} ${rowValue(item.row.label, item.row.after)}`] : [],
      );
  return names.length ? t('heroCard.next', { level: level + 1, list: names.join(', ') }) : null;
}

/** «Тени Солёной Гавани · сессия 12 · 06.11.2026»; без кампании — только дата. */
export function cardFooter(campaign: string | undefined, session: number | undefined, date: Date | string): string {
  return [campaign, campaign && session ? t('heroCard.session', { number: session }) : '', formatShortDate(date)]
    .filter(Boolean)
    .join(' · ');
}

/**
 * Стиль карты: выбранный игроком, иначе по классу — у волшебника, колдуна и чародея «Ночь», у остальных «Янтарь».
 * При мультиклассе решает класс с наибольшим числом уровней, при равенстве — первый взятый.
 */
export function defaultCardStyle(character: Character): CardStyle {
  if (character.heroCardStyle) {
    return character.heroCardStyle;
  }
  const main = character.classes.reduce(
    (best, entry) => (entry.level > best.level ? entry : best),
    character.classes[0],
  );
  return main && NIGHT_CLASSES.has(main.classId) ? 'night' : 'amber';
}

/** Подпись карты для экранного диктора: «Карта героя: Ирма Вейл, 6-й уровень. Хиты 46, плюс 8. …». */
export function cardA11yLabel(name: string, level: number, stats: CardStat[]): string {
  const spoken = (value: string) =>
    value.replace(/^\+/, `${t('heroCard.plus')} `).replace(/^[−-]/, `${t('heroCard.minus')} `);
  const parts = stats.map((stat) => {
    const label = stat.label.charAt(0) + stat.label.slice(1).toLocaleLowerCase();
    return `${label} ${spoken(stat.value)}${stat.change ? `, ${spoken(stat.change)}` : ''}.`;
  });
  return [t('heroCard.a11y', { name, level }), ...parts].join(' ');
}

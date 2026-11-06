// Тексты карт колоды на текущем языке: названия, подписи строк «было → стало», метки, разбор хитов.
// Карты хранят только id и числа (model/types.ts), здесь они превращаются в слова.

import type { WeaponAttack } from '@/entities/character';
import type { AbilityId } from '@/shared/content';
import { abilityAbbr, byId, itemName, localizeText, nameOf, plain, proficiencyName } from '@/shared/content';
import { t } from '@/shared/i18n';
import { formatDice, formatDie, formatFeet, formatModifier } from '@/shared/lib/dice';

import { DIE_COLUMNS, FEET_COLUMNS } from '../config/deck';
import type {
  CardRow,
  CardRowLabel,
  CardRowValue,
  CardTag,
  HpBreakdownPart,
  LevelChoice,
  LevelUpCard,
  NextLevelItem,
} from '../model/types';

/** Что нужно знать о персонаже, чтобы подписать строки (названия оружия). */
export type TextContext = { attacks?: WeaponAttack[] };

const MODIFIER_KEYS = new Set(['save', 'skill', 'attack', 'spellAttack', 'initiative', 'profBonus']);
const DICE = /^(\d+×)?\d+d\d+$/;

/** Кости из справочника «2d10» → «2к10»; лучи «2×1d10» → «2 × 1к10». */
export function diceText(value: string): string {
  const [beams, dice] = value.includes('×') ? value.split('×') : [undefined, value];
  return beams ? `${beams} × ${formatDice(dice)}` : formatDice(dice);
}

const spellName = (id: string) => localizeText(byId.spells.get(id)?.name).text || id;
const resourceName = (id: string) => localizeText(byId.resources.get(id)?.name).text || id;

export function rowLabel(label: CardRowLabel, context: TextContext = {}): string {
  switch (label.kind) {
    case 'number': {
      if (label.key === 'ability') {
        return abilityAbbr(label.ref as AbilityId);
      }
      if (label.key === 'save') {
        return t('levelUpDeck.row.save', { ability: abilityAbbr(label.ref as AbilityId) });
      }
      if (label.key === 'skill') {
        return nameOf('skills', label.ref);
      }
      if (label.key === 'attack' || label.key === 'attackDamage') {
        const attack = context.attacks?.find((a) => a.key === label.ref);
        const weapon = attack ? itemName({ itemId: attack.itemId }) : (label.ref ?? '');
        return t(`levelUpDeck.row.${label.key}`, { weapon });
      }
      return t(`levelUpDeck.row.${label.key}`);
    }
    case 'column':
      return t(`levelUpDeck.column.${label.column}`, { defaultValue: label.column });
    case 'resource':
      return resourceName(label.id);
    case 'slots':
      return t('levelUpDeck.row.slots', { circle: label.circle });
    case 'pact':
      return t('levelUpDeck.row.pact');
    case 'limit':
      return t(`levelUpDeck.row.${label.limit}`);
    case 'cantrip':
      return spellName(label.spellId);
    case 'trait':
      return nameOf('traits', label.traitId);
    case 'spell':
      return spellName(label.spellId);
    case 'proficiency':
      return proficiencyName(label.id);
    case 'feature':
      return nameOf('features', label.id);
  }
}

export function rowValue(label: CardRowLabel, value: CardRowValue): string {
  if (typeof value === 'boolean') {
    return value ? t('levelUpDeck.row.yes') : t('levelUpDeck.row.no');
  }
  if (typeof value === 'object') {
    if ('circle' in value) {
      return t('levelUpDeck.row.pactValue', { count: value.count, circle: value.circle });
    }
    return value.die
      ? t('levelUpDeck.row.resourceDie', { max: value.max, die: formatDie(value.die) })
      : String(value.max);
  }
  if (typeof value === 'string') {
    return DICE.test(value) ? diceText(value) : value;
  }
  if (label.kind === 'number' && MODIFIER_KEYS.has(label.key)) {
    return formatModifier(value);
  }
  if (label.kind === 'number' && label.key === 'speed') {
    return formatFeet(value);
  }
  if (label.kind === 'column' && DIE_COLUMNS.has(label.column)) {
    return formatDie(value);
  }
  if (label.kind === 'column' && FEET_COLUMNS.has(label.column)) {
    return formatFeet(value);
  }
  return String(value);
}

/** Строка одной фразой: «Скрытая атака 3к6 → 4к6». */
export function rowText(row: CardRow, context: TextContext = {}): string {
  const after = rowValue(row.label, row.after);
  const label = rowLabel(row.label, context);
  return row.before === undefined ? `${label} ${after}` : `${label} ${rowValue(row.label, row.before)} → ${after}`;
}

export function tagText(tag: CardTag): string {
  if (tag.kind === 'action') {
    return t(`levelUpDeck.action.${tag.action}`);
  }
  const kind = tag.recovery === 'long' ? 'long' : tag.recovery === 'short' ? 'short' : 'shortOne';
  return t(`levelUpDeck.uses.${kind}`, { count: tag.max });
}

/** Название выбора («Компетентность», «Таинственные воззвания»). */
export function choiceTitle(choice: LevelChoice): string {
  if (choice.kind === 'feat') {
    return t(choice.featSlot === 'epic-boon' ? 'levelUpDeck.choiceKind.epicBoon' : 'levelUpDeck.choiceKind.feat');
  }
  if (choice.kind === 'classOption') {
    return t(`levelUpDeck.choiceKind.${choice.optionKind ?? 'invocation'}`);
  }
  if (choice.kind === 'replaceOption') {
    return choice.optionKind === 'metamagic'
      ? t('levelUpDeck.choiceKind.replaceMetamagic')
      : choice.optionKind === 'invocation' || choice.featureId
        ? t('levelUpDeck.choiceKind.replaceInvocation')
        : t('levelUpDeck.choiceKind.replaceOption');
  }
  if ((choice.kind === 'featureOption' || choice.kind === 'optionChoice') && choice.featureId) {
    return nameOf('features', choice.featureId);
  }
  return t(`levelUpDeck.choiceKind.${choice.kind}`);
}

/** Что выбрать — для «Сначала выберите навыки». */
export function choiceWhat(choice: LevelChoice): string {
  if (choice.kind === 'feat' && choice.featSlot === 'epic-boon') {
    return t('levelUpDeck.choiceWhat.epicBoon');
  }
  if (choice.kind === 'classOption') {
    return t(`levelUpDeck.choiceWhat.${choice.optionKind ?? 'invocation'}`);
  }
  return t(`levelUpDeck.choiceWhat.${choice.kind}`);
}

/** Подпись на заблокированной кнопке «Дальше». */
export function needFirstText(choice: LevelChoice): string {
  return t('levelUpDeck.needFirst', { what: choiceWhat(choice) });
}

/** Название карты на текущем языке. */
export function cardTitle(card: LevelUpCard, context: TextContext = {}): string {
  if (card.type === 'hp') {
    return t('levelUpDeck.hp.title');
  }
  if (card.type === 'growth') {
    const first = card.rows?.[0];
    return card.rows?.length === 1 && first ? rowText(first, context) : t('levelUpDeck.type.growth');
  }
  if (card.type === 'magic') {
    const opened = card.rows
      ?.filter((r) => r.label.kind === 'slots' && r.before === 0)
      .map((r) => (r.label.kind === 'slots' ? r.label.circle : 0));
    if (opened?.length) {
      return t('levelUpDeck.magic.newCircle', { circle: Math.max(...opened) });
    }
    const pact = card.rows?.find((r) => r.label.kind === 'pact');
    if (pact && typeof pact.after === 'object' && 'circle' in pact.after) {
      return t('levelUpDeck.magic.pact', { circle: pact.after.circle });
    }
    return t('levelUpDeck.magic.title', { className: nameOf('classes', card.source.id) });
  }
  if (card.type === 'multiclass') {
    return t('levelUpDeck.classLevel', { className: nameOf('classes', card.source.id), level: 1 });
  }
  if (card.type === 'choice' && card.choice && card.ref?.table !== 'features') {
    return choiceTitle(card.choice);
  }
  if (card.ref) {
    return nameOf(card.ref.table, card.ref.id);
  }
  return card.choice ? choiceTitle(card.choice) : t(`levelUpDeck.type.${card.type}`);
}

/** Короткое название для рубашки и ленты колоды. */
export function cardShortTitle(card: LevelUpCard): string {
  if (
    card.type === 'feature' ||
    card.type === 'capstone' ||
    (card.type === 'species' && card.ref?.table === 'traits')
  ) {
    return card.ref ? nameOf(card.ref.table, card.ref.id) : t(`levelUpDeck.type.${card.type}`);
  }
  if (card.type === 'choice' && card.choice) {
    return card.ref?.table === 'features' ? nameOf('features', card.ref.id) : choiceTitle(card.choice);
  }
  return t(`levelUpDeck.type.${card.type}`);
}

/** Описание карты из справочника (умение, особенность вида) или пояснение выбора. */
export function cardBody(card: LevelUpCard): string {
  if (card.ref?.table === 'features' || card.ref?.table === 'traits') {
    const entry = card.ref.table === 'features' ? byId.features.get(card.ref.id) : byId.traits.get(card.ref.id);
    const summary = entry?.summary ? localizeText(entry.summary).text : '';
    if (summary) {
      return summary;
    }
    const text = plain(entry?.description);
    if (text) {
      return text;
    }
  }
  if (card.choice?.kind === 'replaceOption') {
    return t('levelUpDeck.replaceBody');
  }
  if (card.choice) {
    return t('levelUpDeck.choiceBody', { count: card.choice.count });
  }
  return '';
}

/** Метка над названием: «ПЛУТ 6», «ВИД · ДРАКОНОРОЖДЁННЫЙ», «РЕАКЦИЯ · 1 РАЗ · КОРОТКИЙ ОТДЫХ». */
export function cardKicker(card: LevelUpCard, classLevel: number): string {
  switch (card.type) {
    case 'growth':
      return t('levelUpDeck.tag.growth');
    case 'magic':
      return t('levelUpDeck.tag.magic');
    case 'multiclass':
      return t('levelUpDeck.tag.multiclass');
    case 'capstone':
      return t('levelUpDeck.tag.capstone');
    case 'species':
      return t('levelUpDeck.tag.species', { species: nameOf('species', card.source.id) });
    case 'hp':
      return t('levelUpDeck.hp.title');
    default: {
      const classId = card.choice?.classId ?? card.source.id;
      const name =
        card.source.kind === 'subclass'
          ? localizeText(byId.subclasses.get(card.source.id ?? '')?.name).text
          : nameOf('classes', classId);
      return t('levelUpDeck.tag.classLevel', { className: name, level: classLevel });
    }
  }
}

/** Разбор хитов одной строкой: «6 на кубике + 2 (ТЕЛ) + 1 (Дварфийская стойкость)». */
export function hpBreakdownText(parts: HpBreakdownPart[]): string {
  const signed = (value: number, text: string, first: boolean) =>
    first ? text : value < 0 ? `− ${text.replace(/^-/, '')}` : `+ ${text}`;
  return parts
    .map((part, i) => {
      const abs = Math.abs(part.value);
      const value = i === 0 ? part.value : abs;
      switch (part.kind) {
        case 'die':
          return signed(
            part.value,
            t(part.method === 'average' ? 'levelUpDeck.hp.partAverage' : 'levelUpDeck.hp.partDie', { value }),
            i === 0,
          );
        case 'con':
          return signed(part.value, t('levelUpDeck.hp.partCon', { value }), i === 0);
        case 'minimum':
          return signed(part.value, t('levelUpDeck.hp.partMinimum', { value }), i === 0);
        case 'bonus':
          return signed(part.value, t('levelUpDeck.hp.partBonus', { value, name: sourceName(part.sourceId) }), i === 0);
        case 'retroCon':
          return signed(
            part.value,
            t('levelUpDeck.hp.partRetro', { value, perLevel: formatModifier(part.perLevel), levels: part.levels }),
            i === 0,
          );
        case 'other':
          return signed(part.value, t('levelUpDeck.hp.partOther', { value }), i === 0);
      }
    })
    .join(' ');
}

/** Источник бонуса хитов: особенность вида, умение класса или черта. */
function sourceName(id: string): string {
  const table = byId.traits.has(id) ? 'traits' : byId.features.has(id) ? 'features' : 'feats';
  return nameOf(table, id);
}

/** «3 новинки, 1 выбор». */
export function countsText(news: number, choices: number): string {
  const parts = [t('levelUpDeck.news', { count: news })];
  if (choices) {
    parts.push(t('levelUpDeck.choices', { count: choices }));
  }
  return parts.join(', ');
}

/** «Увёртливость, Надёжный талант, скрытая атака 4к6». */
export function nextLevelText(items: NextLevelItem[], context: TextContext = {}): string {
  return items
    .map((item, i) => {
      if (item.kind === 'feature') {
        return nameOf(item.source === 'species' ? 'traits' : 'features', item.id);
      }
      const text = `${rowLabel(item.row.label, context)} ${rowValue(item.row.label, item.row.after)}`;
      return i === 0 ? text : lowerFirst(text);
    })
    .join(', ');
}

/** Первая буква строчная: «Пассивное восприятие» → «пассивное восприятие». */
export function lowerFirst(text: string): string {
  return text ? text[0].toLocaleLowerCase() + text.slice(1) : text;
}

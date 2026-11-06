// Свёрнутый вид карт экрана «Новое на N-м уровне»: сводка одной строкой и группы раскрытого роста
// (design/level-up/deck-screen-spec.md, разделы 6.1–6.5).

import { byId, localizeText, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';

import type { CardRow, GrowthGroup, GrowthGroupId, LevelUpCard, NumberKey, PickedItem, SlotLine } from '../model/types';
import type { TextContext } from './cardText';
import { cardTitle, lowerFirst, rowText, tagText } from './cardText';

const GROUP_ORDER: GrowthGroupId[] = ['saves', 'skills', 'attacks', 'magic', 'species', 'other'];

const NUMBER_GROUPS: Partial<Record<NumberKey, GrowthGroupId>> = {
  save: 'saves',
  skill: 'skills',
  passivePerception: 'skills',
  passiveInsight: 'skills',
  passiveInvestigation: 'skills',
  attack: 'attacks',
  attackDamage: 'attacks',
  spellSaveDC: 'magic',
  spellAttack: 'magic',
};

function groupOf(row: CardRow): GrowthGroupId {
  switch (row.label.kind) {
    case 'number':
      return NUMBER_GROUPS[row.label.key] ?? 'other';
    case 'cantrip':
      return 'magic';
    case 'trait':
      return 'species';
    case 'spell':
      return row.label.list === 'species' ? 'species' : 'magic';
    default:
      return 'other';
  }
}

/** Строки роста по группам: СПАСБРОСКИ, НАВЫКИ, АТАКИ, МАГИЯ, ВИД, ПРОЧЕЕ; пустые группы выкидываются. */
export function groupGrowthRows(rows: CardRow[]): GrowthGroup[] {
  return GROUP_ORDER.map((id) => ({ id, rows: rows.filter((row) => groupOf(row) === id) })).filter(
    (group) => group.rows.length > 0,
  );
}

/**
 * Главная строка карты роста (бонус мастерства, а без него — первая) и всё остальное одним списком
 * для «Изменилось N чисел»: числа, выросшие от главной строки, и прочие строки вместе с их числами.
 */
export function growthParts(rows: CardRow[]): { main?: CardRow; rest: CardRow[] } {
  const main = rows.find((row) => row.label.kind === 'number' && row.label.key === 'profBonus') ?? rows[0];
  if (!main) {
    return { rest: [] };
  }
  const others = rows.filter((row) => row !== main).flatMap((row) => [row, ...(row.details ?? [])]);
  return { main, rest: [...(main.details ?? []), ...others] };
}

/** Источник умения: «паладин 5», «Клятва преданности 3». */
export function cardSourceText(card: LevelUpCard): string {
  const { kind, id, level } = card.source;
  if (kind === 'subclass') {
    const name = localizeText(byId.subclasses.get(id ?? '')?.name).text;
    return name ? t('levelUpDeck.tag.classLevel', { className: name, level: level ?? '' }).trim() : '';
  }
  if (kind === 'class' || kind === 'multiclass') {
    return t('levelUpDeck.tag.classLevel', {
      className: lowerFirst(nameOf('classes', id)),
      level: level ?? (kind === 'multiclass' ? 1 : ''),
    }).trim();
  }
  return '';
}

/** Самый заметный круг ячеек на карте магии: открытый впервые, иначе самый высокий из изменившихся. */
function circleText(card: LevelUpCard): string {
  const slots = (card.rows ?? []).flatMap((row) =>
    row.label.kind === 'slots' ? [{ row, circle: row.label.circle }] : [],
  );
  const opened = slots.filter(({ row }) => !row.before);
  const pick = (opened.length ? opened : slots).map(({ circle }) => circle);
  if (pick.length) {
    return t('levelUpDeck.screen.circle', { circle: Math.max(...pick) });
  }
  const pact = card.rows?.find((row) => row.label.kind === 'pact');
  if (pact && typeof pact.after === 'object' && 'circle' in pact.after) {
    return t('levelUpDeck.screen.pactCircle', { circle: pact.after.circle });
  }
  return '';
}

export type SummaryOptions = {
  /** Выбранное на этом уровне для карты выбора или магии. */
  picked?: PickedItem[];
  /** Необязательный выбор оставлен как есть («Не менять»). */
  kept?: boolean;
  context?: TextContext;
};

/** Что выбрано: названия через запятую, «не менять» или «нужен выбор». */
function choiceText(card: LevelUpCard, options: SummaryOptions): string {
  if (options.picked?.length) {
    return options.picked.map((item) => item.name).join(', ');
  }
  if (card.choice && !card.choice.required && options.kept) {
    return t('levelUpDeck.screen.notChanged');
  }
  return t('levelUpDeck.needsChoice');
}

/** Сводка свёрнутой карты одной строкой (раздел 6 спецификации). */
export function cardSummary(card: LevelUpCard, options: SummaryOptions = {}): string {
  const tags = (card.tags ?? []).map(tagText);
  const join = (parts: string[]) => parts.filter(Boolean).join(' · ');
  switch (card.type) {
    case 'hp':
      return card.hp ? `${card.hp.maxBefore} → ${card.hp.maxAfter}` : '';
    case 'growth': {
      const { main } = growthParts(card.rows ?? []);
      return main ? rowText(main, options.context) : '';
    }
    case 'choice':
      return choiceText(card, options);
    case 'magic': {
      const circle = circleText(card);
      const choice = card.choice ? choiceText(card, options) : '';
      return join([circle, choice]) || cardTitle(card, options.context);
    }
    case 'species': {
      const rows = (card.rows ?? []).map((row) => lowerFirst(rowText(row, options.context))).join(', ');
      const grown = rows && tags.length ? t('levelUpDeck.screen.andAlso', { text: rows }) : rows;
      return join([t('levelUpDeck.screen.species'), ...tags, grown]);
    }
    default:
      return join([cardSourceText(card), ...tags]);
  }
}

/** Метка типа карты: «Новое умение», «Магия», «Вид · Драконорождённый». */
export function cardTypeLabel(card: LevelUpCard): string {
  switch (card.type) {
    case 'hp':
      return t('levelUpDeck.type.hp');
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
    case 'choice':
      return card.ref?.table === 'features'
        ? t('levelUpDeck.screen.kind.feature')
        : t('levelUpDeck.screen.kind.choice');
    case 'feature':
      return t('levelUpDeck.screen.kind.feature');
  }
}

/** Метка открытой карты: тип и источник («Новое умение · паладин 5», «Магия · паладин»). */
export function cardOpenLabel(card: LevelUpCard): string {
  const type = cardTypeLabel(card);
  const source =
    card.type === 'magic'
      ? lowerFirst(nameOf('classes', card.source.id))
      : card.type === 'feature' || card.type === 'choice' || card.type === 'capstone'
        ? cardSourceText(card)
        : '';
  return source ? `${type} · ${source}` : type;
}

/**
 * Ячейки на карте магии: каждый круг, где что-то изменилось, и все круги ниже для контекста
 * (раздел 6.4 спецификации). `before` / `after` — ячейки по кругам из снимков уровня.
 */
export function slotLines(before: number[], after: number[]): SlotLine[] {
  let top = -1;
  after.forEach((count, i) => {
    if (count !== (before[i] ?? 0)) {
      top = i;
    }
  });
  return after
    .slice(0, top + 1)
    .map((count, i) => ({ circle: i + 1, count, before: before[i] ?? 0 }))
    .filter((line) => line.count > 0);
}

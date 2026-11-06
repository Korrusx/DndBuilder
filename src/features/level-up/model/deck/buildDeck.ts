// Колода уровня: карты из разницы листов + карты выборов в порядке раздела 5, флаги блокирующих выборов.

import { CARD_ORDER, CHOICE_ORDER, DIE_COLUMNS, MAGIC_CHOICES } from '../../config/deck';
import type { Deck, LevelChoice, LevelUpCard, SheetDiff } from '../types';

/** Выбор показывается картой, если на уровне есть что выбирать или что исправить. */
const visible = (choice: LevelChoice) =>
  choice.count > 0 || choice.problems.length > 0 || choice.kind === 'replaceOption';

/** Ранг карты выбора: подкласс → черта → выборы класса → выборы подкласса → необязательная замена. */
function choiceRank(choice: LevelChoice): number {
  const kind = CHOICE_ORDER.indexOf(choice.kind);
  const fromSubclass = choice.source === 'subclass' && choice.kind !== 'subclass' ? 100 : 0;
  const optional = choice.required ? 0 : 1000;
  return optional + fromSubclass + kind;
}

function featureRank(card: LevelUpCard): number {
  return card.source.kind === 'subclass' ? 1 : 0;
}

export type BuildDeckOptions = {
  /** Карты, которые игрок уже перевернул (из отложенного повышения). */
  revealed?: string[];
  /** Разница листов — для блока «Без изменений». */
  diff?: SheetDiff;
};

export function buildDeck(cards: LevelUpCard[], choices: LevelChoice[], options: BuildDeckOptions = {}): Deck {
  const out = cards.map((c) => ({ ...c }));
  const shown = choices.filter(visible);

  for (const choice of shown) {
    if (MAGIC_CHOICES.includes(choice.kind)) {
      const id = `magic.${choice.classId}`;
      const magic = out.find((c) => c.id === id);
      // Новые заклинания и книга волшебника — одна карта; в ней первый ещё не сделанный выбор.
      if (magic) {
        magic.choice = magic.choice && !magic.choice.done ? magic.choice : choice;
      } else {
        out.push({
          id,
          type: 'magic',
          source: { kind: 'class', id: choice.classId },
          ref: { table: 'classes', id: choice.classId },
          choice,
          state: 'hidden',
        });
      }
      continue;
    }
    // Выбор от нового умения («Компетентность», «Стиль боя») — сама карта этого умения.
    const feature = choice.featureId ? out.find((c) => c.id === `feature.${choice.featureId}` && !c.choice) : undefined;
    if (feature && feature.type === 'feature') {
      feature.type = 'choice';
      feature.choice = choice;
      continue;
    }
    out.push({
      id: `choice.${choice.id}`,
      type: 'choice',
      source: { kind: choice.source === 'multiclass' ? 'multiclass' : choice.source, id: choice.classId },
      ...(choice.featureId ? { ref: { table: 'features' as const, id: choice.featureId } } : {}),
      choice,
      state: 'hidden',
    });
  }

  const ordered = out
    .map((card, i) => ({ card, i }))
    .sort((a, b) => {
      const type = CARD_ORDER.indexOf(a.card.type) - CARD_ORDER.indexOf(b.card.type);
      if (type) {
        return type;
      }
      if (a.card.type === 'feature') {
        return featureRank(a.card) - featureRank(b.card) || a.i - b.i;
      }
      if (a.card.type === 'choice' && a.card.choice && b.card.choice) {
        return choiceRank(a.card.choice) - choiceRank(b.card.choice) || a.i - b.i;
      }
      return a.i - b.i;
    })
    .map(({ card }) => card);

  const revealed = new Set(options.revealed ?? []);
  for (const card of ordered) {
    const open = revealed.has(card.id);
    card.state = !open ? 'hidden' : !card.choice || card.choice.done ? 'done' : 'revealed';
  }

  // Обязательные выборы: и показанные картами, и спрятанные в карте магии (книга при выборе заклинаний).
  const blockers = choices.filter((c) => visible(c) && c.required && !c.done);
  return {
    cards: ordered,
    blockers: [...blockers].sort((a, b) => choiceRank(a) - choiceRank(b)),
    counts: {
      news: ordered.filter((c) => c.type !== 'hp').length,
      choices: shown.length,
    },
    unchanged: options.diff ? unchanged(options.diff) : [],
  };
}

/** Что на уровне не растёт: бонус мастерства, кости (столбцы-кости, урон заговоров и вида, кости ресурсов). */
function unchanged(diff: SheetDiff): Deck['unchanged'] {
  const out: Deck['unchanged'] = [];
  if (!diff.numbers.some((n) => n.key === 'profBonus')) {
    out.push('profBonus');
  }
  const diceColumn = diff.columns.some((c) => DIE_COLUMNS.has(c.column) || typeof c.after === 'string');
  const diceResource = diff.resources.some((r) => r.before && r.before.die !== r.after.die);
  const traitDice = diff.traitDamage.some((d) => d.before);
  if (!diceColumn && !diceResource && !diff.cantripDamage.length && !traitDice) {
    out.push('dice');
  }
  return out;
}

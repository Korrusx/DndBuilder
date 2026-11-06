// Предпросмотры: новинки следующего уровня, главные изменения для итоговой карточки и для экрана выбора.

import type { Character } from '@/entities/character';
import { totalLevel } from '@/entities/character';
import type { Content } from '@/shared/content';

import {
  CHOICE_PREVIEW_ROWS,
  KEY_NUMBER_PRIORITY,
  KEY_NUMBERS_LIMIT,
  MAGIC_COLUMN,
  SIDE_EFFECT_NUMBERS,
} from '../../config/deck';
import { MAX_LEVEL } from '../../config/constants';
import { startLevelUp } from '../levelup';
import type { CardRow, LevelSnapshot, NextLevelItem, NumberChange } from '../types';
import { isPlaceholder } from './classifyChanges';
import { diffSheets } from './diffSheets';
import { levelSnapshot } from './snapshot';

const numberRow = (n: NumberChange): CardRow => ({
  label: { kind: 'number', key: n.key, ...(n.ref ? { ref: n.ref } : {}) },
  before: n.before,
  after: n.after,
});

/** Числа по приоритету раздела 7.2: хиты, атака основным оружием, СЛ, навыки с компетентностью… */
function ranked(changes: NumberChange[], after: LevelSnapshot): NumberChange[] {
  const mainAttack = after.sheet.attacks[0]?.key;
  const expert = new Set(after.sheet.skills.filter((s) => s.expertise).map((s) => s.id));
  const score = (n: NumberChange) => {
    const base = KEY_NUMBER_PRIORITY.indexOf(n.key) * 10;
    if (n.key === 'attack') {
      return n.ref === mainAttack ? base : base + 5;
    }
    if (n.key === 'skill') {
      return expert.has(n.ref ?? '') ? base : base + 5;
    }
    return base;
  };
  return changes
    .filter((n) => KEY_NUMBER_PRIORITY.includes(n.key))
    .map((n, i) => ({ n, i }))
    .sort((a, b) => score(a.n) - score(b.n) || a.i - b.i)
    .map(({ n }) => n);
}

/** До `limit` главных изменений для итоговой карточки. */
export function keyNumbersPreview(
  before: LevelSnapshot,
  after: LevelSnapshot,
  content: Content,
  limit = KEY_NUMBERS_LIMIT,
): CardRow[] {
  const changes = diffSheets(before, after, content).numbers;
  // Основная атака одна: остальные атаки в главных числах не нужны.
  const mainAttack = after.sheet.attacks[0]?.key;
  return ranked(changes, after)
    .filter((n) => (n.key !== 'attack' && n.key !== 'attackDamage') || n.ref === mainAttack)
    .slice(0, limit)
    .map(numberRow);
}

/**
 * Предпросмотр варианта выбора (раздел 7.4): до трёх изменившихся ключевых чисел и одна строка побочного эффекта
 * («Заодно вырастет пассивное восприятие»). `before` — черновик без варианта, `after` — с ним.
 */
export function choicePreview(
  before: LevelSnapshot,
  after: LevelSnapshot,
  content: Content,
): { rows: CardRow[]; sideEffect?: CardRow } {
  const changes = ranked(diffSheets(before, after, content).numbers, after);
  const side = changes.find((n) => SIDE_EFFECT_NUMBERS.includes(n.key));
  const rows = changes.filter((n) => !SIDE_EFFECT_NUMBERS.includes(n.key)).slice(0, CHOICE_PREVIEW_ROWS);
  return { rows: rows.map(numberRow), ...(side ? { sideEffect: numberRow(side) } : {}) };
}

/**
 * Что появится на следующем уровне класса `classId` (без выборов): новые умения класса, подкласса и вида,
 * рост костей таблицы класса, урона заговоров и особенностей вида. На 20-м уровне — пусто.
 */
export function nextLevelPreview(
  character: Character,
  content: Content,
  classId = character.classes[0].classId,
): NextLevelItem[] {
  if (totalLevel(character.classes) >= MAX_LEVEL) {
    return [];
  }
  const before = levelSnapshot(character, content);
  const after = levelSnapshot(startLevelUp(character, classId), content);
  const diff = diffSheets(before, after, content);
  const items: NextLevelItem[] = [...diff.added, ...diff.upgraded]
    .filter((f) => f.source !== 'feat' && !isPlaceholder(f.id, content))
    .map((f) => ({ kind: 'feature', id: f.id, source: f.source }));
  for (const col of diff.columns) {
    if (typeof col.after === 'string' && !MAGIC_COLUMN.test(col.column)) {
      items.push({
        kind: 'row',
        row: {
          label: { kind: 'column', classId: col.classId, column: col.column },
          ...(col.before === undefined ? {} : { before: col.before }),
          after: col.after,
        },
      });
    }
  }
  for (const c of diff.cantripDamage) {
    items.push({
      kind: 'row',
      row: {
        label: { kind: 'cantrip', spellId: c.spellId },
        ...(c.before ? { before: c.before } : {}),
        after: c.after,
      },
    });
  }
  for (const d of diff.traitDamage) {
    items.push({
      kind: 'row',
      row: { label: { kind: 'trait', traitId: d.traitId }, ...(d.before ? { before: d.before } : {}), after: d.after },
    });
  }
  return items;
}

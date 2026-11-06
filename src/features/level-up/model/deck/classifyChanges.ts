// Раскладка разницы листов по типам карт (docs/features/level-up.md, раздел 4). Без кода под классы:
// тип карты решают источник умения, уровень и данные справочника (ресурсы, связи «улучшает», метки).

import type { HpChoice, SourcedId } from '@/entities/character';
import { SPELLCASTER_PROGRESSION } from '@/entities/character';
import type { Content } from '@/shared/content';
import { indexOf } from '@/shared/content';

import { CAPSTONE_LEVEL, DERIVED_NUMBERS, MAGIC_COLUMN, PLACEHOLDER_FEATURE } from '../../config/deck';
import type { CardRow, CardTag, LevelSnapshot, LevelUpCard, NumberChange, SheetDiff } from '../types';
import { hpGainFromDiff } from './hpGain';

export type DeckSources = {
  content: Content;
  /** Класс, уровень которого повышен. */
  classId: string;
  /** Класс взят впервые (мультикласс). */
  isNewClass: boolean;
  speciesId: string;
  /** Снимок после повышения: ресурсы для меток, характеристики навыков и атак. */
  after: LevelSnapshot;
  /** Закреплённые хиты уровня; нет — по среднему. */
  hp?: HpChoice;
};

/** Строка-заглушка таблицы класса: вместо неё — карта выбора (подкласс, черта) или умение подкласса. */
export function isPlaceholder(id: string, content: Content): boolean {
  return PLACEHOLDER_FEATURE.test(id) || !!indexOf(content).features.get(id)?.subclassSlot;
}

const numberRow = (n: NumberChange): CardRow => ({
  label: { kind: 'number', key: n.key, ...(n.ref ? { ref: n.ref } : {}) },
  before: n.before,
  after: n.after,
});

/** От какой характеристики зависит производное число. */
function abilityOf(n: NumberChange, after: LevelSnapshot, content: Content): string | undefined {
  switch (n.key) {
    case 'save':
      return n.ref;
    case 'skill':
      return after.sheet.skills.find((s) => s.id === n.ref)?.ability;
    case 'attack':
    case 'attackDamage':
      return after.sheet.attacks.find((a) => a.key === n.ref)?.ability;
    case 'spellSaveDC':
    case 'spellAttack':
      return after.sheet.spellcastingClasses.find((s) => s.classId === n.ref)?.ability;
    case 'initiative':
      return 'dex';
    case 'passivePerception':
    case 'passiveInsight':
      return indexOf(content).skills.get(n.key === 'passivePerception' ? 'perception' : 'insight')?.ability;
    case 'passiveInvestigation':
      return indexOf(content).skills.get('investigation')?.ability;
    default:
      return undefined;
  }
}

/**
 * Строки роста: бонус мастерства раскрывается всеми изменившимися от него числами; без роста мастерства
 * производные числа собираются под строкой характеристики, которая их изменила.
 */
function numberRows(diff: SheetDiff, sources: DeckSources): CardRow[] {
  const derived = diff.numbers.filter((n) => DERIVED_NUMBERS.includes(n.key));
  const rows: CardRow[] = [];
  const pb = diff.numbers.find((n) => n.key === 'profBonus');
  const used = new Set<NumberChange>();
  if (pb) {
    rows.push({ ...numberRow(pb), details: derived.map(numberRow) });
    derived.forEach((n) => used.add(n));
  }
  for (const ability of diff.numbers.filter((n) => n.key === 'ability')) {
    const own = pb
      ? []
      : derived.filter((n) => !used.has(n) && abilityOf(n, sources.after, sources.content) === ability.ref);
    own.forEach((n) => used.add(n));
    rows.push({ ...numberRow(ability), ...(own.length ? { details: own.map(numberRow) } : {}) });
  }
  for (const n of diff.numbers) {
    if (n.key === 'maxHp' || n.key === 'profBonus' || n.key === 'ability' || used.has(n)) {
      continue;
    }
    rows.push(numberRow(n));
  }
  return rows;
}

/** Метки умения: когда используется и сколько раз (по ресурсам справочника). */
function tagsOf(id: string, table: 'features' | 'traits', sources: DeckSources): CardTag[] {
  const idx = indexOf(sources.content);
  const feature = table === 'features' ? idx.features.get(id) : undefined;
  const action = feature ? feature.action : idx.traits.get(id)?.action;
  // «Дополнительная атака»: вместо «всегда действует» — «действие «Атака»» и число атак.
  const tags: CardTag[] = feature?.attacks
    ? [{ kind: 'attackAction' }, { kind: 'attacks', count: feature.attacks }]
    : action
      ? [{ kind: 'action', action }]
      : [];
  for (const r of sources.content.resources.filter((res) => res.features.includes(id))) {
    const view = sources.after.resources.find((v) => v.id === r.id);
    if (view) {
      tags.push({ kind: 'uses', max: view.max, recovery: view.recovery });
    }
  }
  return tags;
}

/** Ресурсы, которые уже стоят меткой на карте нового умения, не повторяются строкой роста. */
function resourcesOnCards(features: SourcedId[], content: Content): Set<string> {
  const ids = new Set(features.map((f) => f.id));
  return new Set(content.resources.filter((r) => r.features.some((id) => ids.has(id))).map((r) => r.id));
}

/** Столбец таблицы класса уже показан ресурсом (ярость: столбец rage_count и ресурс «Ярость»). */
function columnIsResource(classId: string, column: string, diff: SheetDiff, content: Content): boolean {
  return content.resources.some(
    (r) =>
      r.classId === classId &&
      'classSpecific' in r.max &&
      r.max.classSpecific === column &&
      diff.resources.some((d) => d.id === r.id),
  );
}

/** Класс, к карте магии которого относятся общие ячейки. */
function slotsOwner(sources: DeckSources): string | undefined {
  const casters = sources.after.casters.map((c) => c.classId);
  const regular = casters.filter((id) => SPELLCASTER_PROGRESSION[id] !== 'pact');
  return regular.includes(sources.classId) ? sources.classId : regular[0];
}

export function classifyChanges(diff: SheetDiff, sources: DeckSources): LevelUpCard[] {
  const { content } = sources;
  const idx = indexOf(content);
  const cards: LevelUpCard[] = [];
  const card = (c: Omit<LevelUpCard, 'state'>) => cards.push({ ...c, state: 'hidden' });

  // --- Хиты ---
  const cls = idx.classes.get(sources.classId);
  const die = cls?.hitDie ?? 8;
  const maxChange = diff.numbers.find((n) => n.key === 'maxHp');
  const hp = hpGainFromDiff(diff, die, sources.hp?.method ?? 'average', sources.hp?.value);
  const maxBefore = maxChange ? Number(maxChange.before) : sources.after.sheet.maxHp;
  card({
    id: 'hp',
    type: 'hp',
    source: { kind: 'class', id: sources.classId },
    hp: { ...hp, die, maxBefore, maxAfter: maxBefore + hp.gain },
  });

  // --- Новые умения класса и подкласса ---
  const classLevel = sources.after.classLevels[sources.classId] ?? 1;
  const isOwnFeature = (f: SourcedId) =>
    (f.source === 'class' || f.source === 'subclass') && !isPlaceholder(f.id, content);
  const newFeatures = [...diff.added.filter(isOwnFeature), ...diff.upgraded.filter(isOwnFeature)];
  const covered = resourcesOnCards([...newFeatures, ...diff.added.filter((f) => f.source === 'species')], content);

  // --- Рост: числа, столбцы таблиц, ресурсы, урон заговоров ---
  const growth: CardRow[] = [...numberRows(diff, sources)];
  for (const col of diff.columns) {
    if (MAGIC_COLUMN.test(col.column) || columnIsResource(col.classId, col.column, diff, content)) {
      continue;
    }
    growth.push({
      label: { kind: 'column', classId: col.classId, column: col.column },
      ...(col.before === undefined ? {} : { before: col.before }),
      after: col.after,
    });
  }
  for (const r of diff.resources) {
    if (covered.has(r.id) && !r.before) {
      continue;
    }
    growth.push({ label: { kind: 'resource', id: r.id }, ...(r.before ? { before: r.before } : {}), after: r.after });
  }
  for (const c of diff.cantripDamage) {
    growth.push({
      label: { kind: 'cantrip', spellId: c.spellId },
      ...(c.before ? { before: c.before } : {}),
      after: c.after,
    });
  }

  if (sources.isNewClass) {
    // Первый уровень нового класса: владения, умения 1-го уровня и рост — в одной карте.
    const multiclass = cls?.multiclass.proficiencies ?? [];
    card({
      id: `multiclass.${sources.classId}`,
      type: 'multiclass',
      source: { kind: 'multiclass', id: sources.classId, level: 1 },
      ref: { table: 'classes', id: sources.classId },
      rows: [
        ...multiclass.map((id): CardRow => ({ label: { kind: 'proficiency', id }, after: true })),
        ...newFeatures.map((f): CardRow => ({ label: { kind: 'feature', id: f.id }, after: true })),
        ...growth,
      ],
    });
  } else {
    if (growth.length) {
      card({ id: 'growth', type: 'growth', source: { kind: 'general' }, rows: growth });
    }
    for (const f of newFeatures) {
      const feature = idx.features.get(f.id);
      const upgradedFrom = 'from' in f ? (f as { from: string }).from : undefined;
      const capstone = feature?.level === CAPSTONE_LEVEL && classLevel === CAPSTONE_LEVEL;
      card({
        id: `feature.${f.id}`,
        type: capstone ? 'capstone' : 'feature',
        source: {
          kind: f.source as 'class' | 'subclass',
          id: feature?.subclassId ?? feature?.classId,
          level: feature?.level,
        },
        ref: { table: 'features', id: f.id },
        tags: tagsOf(f.id, 'features', sources),
        ...(upgradedFrom ? { upgradedFrom } : {}),
      });
    }
  }

  // --- Магия: по карте на класс-заклинатель ---
  const magic = new Map<string, CardRow[]>();
  const add = (classId: string | undefined, row: CardRow) => {
    if (classId) {
      magic.set(classId, [...(magic.get(classId) ?? []), row]);
    }
  };
  const slotClass = slotsOwner(sources);
  for (const s of diff.slots) {
    add(slotClass, { label: { kind: 'slots', circle: s.circle }, before: s.before, after: s.after });
  }
  if (diff.pact) {
    const pactClass = Object.keys(sources.after.classLevels).find((id) => SPELLCASTER_PROGRESSION[id] === 'pact');
    add(pactClass, {
      label: { kind: 'pact' },
      ...(diff.pact.before ? { before: diff.pact.before } : {}),
      after: diff.pact.after,
    });
  }
  for (const l of diff.spellLimits) {
    add(l.classId, {
      label: { kind: 'limit', classId: l.classId, limit: l.limit },
      ...(l.before === undefined ? {} : { before: l.before }),
      after: l.after,
    });
  }
  for (const col of diff.columns.filter((c) => MAGIC_COLUMN.test(c.column))) {
    add(col.classId, {
      label: { kind: 'column', classId: col.classId, column: col.column },
      ...(col.before === undefined ? {} : { before: col.before }),
      after: col.after,
    });
  }
  for (const spellId of diff.alwaysPrepared) {
    add(sources.classId, { label: { kind: 'spell', spellId, list: 'alwaysPrepared' }, after: true });
  }
  for (const [classId, rows] of magic) {
    card({
      id: `magic.${classId}`,
      type: 'magic',
      source: { kind: 'class', id: classId },
      ref: { table: 'classes', id: classId },
      rows,
    });
  }

  // --- Вид: карта на новую особенность и карта роста вида ---
  const newTraits = diff.added.filter((f) => f.source === 'species');
  for (const f of newTraits) {
    const damage = diff.traitDamage.find((d) => d.traitId === f.id);
    card({
      id: `species.${f.id}`,
      type: 'species',
      source: { kind: 'species', id: sources.speciesId },
      ref: { table: 'traits', id: f.id },
      tags: tagsOf(f.id, 'traits', sources),
      ...(damage ? { rows: [{ label: { kind: 'trait', traitId: f.id }, after: damage.after }] } : {}),
    });
  }
  const speciesRows: CardRow[] = [
    ...diff.traitDamage
      .filter((d) => !newTraits.some((f) => f.id === d.traitId))
      .map((d): CardRow => ({
        label: { kind: 'trait', traitId: d.traitId },
        ...(d.before ? { before: d.before } : {}),
        after: d.after,
      })),
    ...diff.speciesSpells.map((spellId): CardRow => ({
      label: { kind: 'spell', spellId, list: 'species' },
      after: true,
    })),
  ];
  if (speciesRows.length) {
    card({
      id: 'species',
      type: 'species',
      source: { kind: 'species', id: sources.speciesId },
      ref: { table: 'species', id: sources.speciesId },
      rows: speciesRows,
    });
  }
  return cards;
}

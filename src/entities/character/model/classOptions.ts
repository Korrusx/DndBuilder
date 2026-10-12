// Варианты умений класса из SRD 5.2: таинственные воззвания колдуна и метамагия чародея,
// а также Книга теней «Договора гримуара». Чистые функции.

import type { ClassOption, Content } from '@/shared/content';
import { indexOf, tr } from '@/shared/content';
import { t } from '@/shared/i18n/model';

import { CHOICE_KEYS, METAMAGIC_COUNT, TOME_CANTRIPS, TOME_RITUALS } from '../config/constants';
import type { Character } from './types';

type Kind = ClassOption['kind'];

export type ClassOptionSlot = {
  kind: Kind;
  classId: string;
  key: string;
  /** Сколько вариантов должно быть выбрано на текущем уровне. */
  count: number;
};

export type ClassOptionSpell = {
  optionId: string;
  spellId: string;
  /** atWill — без ячейки сколько угодно; longRest — раз до долгого отдыха; tome — подготовлено Книгой теней. */
  free: 'atWill' | 'longRest' | 'tome';
  resourceKey: string;
};

const classLevel = (c: Character, classId: string) => c.classes.find((e) => e.classId === classId)?.level ?? 0;

/** Сколько воззваний и вариантов метамагии положено персонажу на его уровнях. */
export function classOptionSlots(c: Character, content: Content): ClassOptionSlot[] {
  const slots: ClassOptionSlot[] = [];
  const warlock = classLevel(c, 'warlock');
  const invocations = indexOf(content).classes.get('warlock')?.levels[warlock - 1]?.classSpecific?.eldritch_invocations;
  if (warlock && typeof invocations === 'number' && invocations > 0) {
    slots.push({ kind: 'invocation', classId: 'warlock', key: CHOICE_KEYS.classOptions('invocation'), count: invocations });
  }
  const sorcerer = classLevel(c, 'sorcerer');
  const metamagic = METAMAGIC_COUNT.filter(([level]) => sorcerer >= level).at(-1)?.[1] ?? 0;
  if (metamagic) slots.push({ kind: 'metamagic', classId: 'sorcerer', key: CHOICE_KEYS.classOptions('metamagic'), count: metamagic });
  return slots;
}

export function chosenClassOptions(c: Character, kind: Kind): string[] {
  return c.choices[CHOICE_KEYS.classOptions(kind)] ?? [];
}

/** Заговоры колдуна, которые персонаж знает (для условий «заговор колдуна, наносящий урон»). */
function warlockCantrips(c: Character, content: Content) {
  const spells = indexOf(content).spells;
  return [...c.cantrips, ...(c.choices[CHOICE_KEYS.tomeCantrips] ?? [])]
    .map((id) => spells.get(id))
    .filter((s) => !!s && s.level === 0 && s.classes.includes('warlock'));
}

/** Выполнены ли условия варианта при текущих выборах (сам вариант в расчёт не берётся). */
export function meetsPrerequisite(c: Character, content: Content, option: ClassOption): boolean {
  const p = option.prerequisite;
  if (!p) return true;
  if (p.level && classLevel(c, option.classId) < p.level) return false;
  if (p.invocation && !chosenClassOptions(c, 'invocation').includes(p.invocation)) return false;
  if (p.cantrip) {
    const ok = warlockCantrips(c, content).some((s) => !!s!.damage && (p.cantrip === 'damage' || !!s!.attackType));
    if (!ok) return false;
  }
  return true;
}

/** Варианты, из которых можно выбирать (выбранные остаются в списке, даже если условие уже не выполнено). */
export function classOptionChoices(c: Character, content: Content, kind: Kind): ClassOption[] {
  const chosen = new Set(chosenClassOptions(c, kind));
  return content.classOptions.filter((o) => o.kind === kind && (chosen.has(o.id) || meetsPrerequisite(c, content, o)));
}

/** Выбранные варианты, условия которых не выполнены (например, сняли «Договор клинка», а «Жаждущий клинок» остался). */
export function unmetClassOptions(c: Character, content: Content): string[] {
  const idx = indexOf(content).classOptions;
  return (['invocation', 'metamagic'] as const)
    .flatMap((kind) => chosenClassOptions(c, kind))
    .filter((id) => {
      const o = idx.get(id);
      return !o || !meetsPrerequisite(c, content, o);
    });
}

/** Выборы Книги теней, если взят «Договор гримуара». */
export function tomeSlots(c: Character, content: Content) {
  if (!chosenClassOptions(c, 'invocation').includes('pact-of-the-tome')) return null;
  const prepared = new Set([...c.cantrips, ...c.preparedSpells]);
  const cantrips = content.spells.filter((s) => s.level === 0 && !prepared.has(s.id)).map((s) => s.id);
  const rituals = content.spells.filter((s) => s.level === 1 && s.ritual && !prepared.has(s.id)).map((s) => s.id);
  return {
    cantrips: { key: CHOICE_KEYS.tomeCantrips, count: TOME_CANTRIPS, options: cantrips },
    rituals: { key: CHOICE_KEYS.tomeRituals, count: TOME_RITUALS, options: rituals },
  };
}

/** Заклинания от воззваний: без ячейки и из Книги теней. */
export function classOptionSpells(c: Character, content: Content): ClassOptionSpell[] {
  const idx = indexOf(content).classOptions;
  const out: ClassOptionSpell[] = [];
  for (const id of chosenClassOptions(c, 'invocation')) {
    for (const s of idx.get(id)?.spells ?? []) {
      out.push({ optionId: id, spellId: s.id, free: s.free, resourceKey: `invocation.${id}.${s.id}` });
    }
  }
  if (chosenClassOptions(c, 'invocation').includes('pact-of-the-tome')) {
    for (const spellId of [...(c.choices[CHOICE_KEYS.tomeCantrips] ?? []), ...(c.choices[CHOICE_KEYS.tomeRituals] ?? [])]) {
      out.push({ optionId: 'pact-of-the-tome', spellId, free: 'tome', resourceKey: '' });
    }
  }
  return out;
}

/** Чего не хватает в выборе вариантов умений: сообщения для мастера создания и повышения уровня. */
export function classOptionProblems(c: Character, content: Content): ({ kind: 'count'; slot: ClassOptionSlot } | { kind: 'unmet'; ids: string[] } | { kind: 'tome' })[] {
  const out: ({ kind: 'count'; slot: ClassOptionSlot } | { kind: 'unmet'; ids: string[] } | { kind: 'tome' })[] = [];
  for (const slot of classOptionSlots(c, content)) {
    if (chosenClassOptions(c, slot.kind).length !== slot.count) out.push({ kind: 'count', slot });
  }
  const unmet = unmetClassOptions(c, content);
  if (unmet.length) out.push({ kind: 'unmet', ids: unmet });
  const tome = tomeSlots(c, content);
  const count = (key: string) => c.choices[key]?.length ?? 0;
  if (tome && (count(tome.cantrips.key) !== tome.cantrips.count || count(tome.rituals.key) !== tome.rituals.count)) out.push({ kind: 'tome' });
  return out;
}

/** То же текстом на текущем языке. */
export function classOptionProblemTexts(c: Character, content: Content): string[] {
  const idx = indexOf(content).classOptions;
  return classOptionProblems(c, content).map((p) =>
    p.kind === 'count'
      ? t(p.slot.kind === 'invocation' ? 'issues.invocations' : 'issues.metamagic', { count: p.slot.count })
      : p.kind === 'unmet'
        ? t('issues.unmetOptions', { list: p.ids.map((id) => tr(idx.get(id)?.name).text || id).join(', ') })
        : t('issues.tome'),
  );
}

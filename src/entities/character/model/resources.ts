// Ресурсы умений с ограниченным числом использований: ярость, дикий облик, кости превосходства, наложение рук…
// Максимум считается из справочника (content.resources), в состоянии игры хранится только потраченное.

import type { ClassResource, Content, ResourceFormula } from '@/shared/content/types';
import { totalLevel } from './character';
import { computeSheet } from './sheet';
import type { Character, CharacterSheet, Ctx, GameState, ResourceView } from './types';

function evalFormula(f: ResourceFormula, { level, sheet, classId }: Ctx): number {
  if ('fixed' in f) return f.fixed;
  if ('classSpecific' in f) {
    const v = classId ? sheet.classSpecific[classId]?.[f.classSpecific] : undefined;
    return typeof v === 'number' ? v : 0;
  }
  if ('byLevel' in f) {
    let value = 0;
    for (const [from, v] of Object.entries(f.byLevel)) if (level >= Number(from)) value = Math.max(value, v);
    return value;
  }
  if ('ability' in f) return Math.max(f.min ?? 0, sheet.abilities[f.ability].mod);
  if ('profBonus' in f) return sheet.profBonus;
  return level * f.perLevel + (f.plus ?? 0);
}

/** Уровень, по которому считается ресурс: уровень его класса, иначе общий. */
function levelFor(r: ClassResource, c: Character): number {
  if (!r.classId) return totalLevel(c.classes);
  return c.classes.find((e) => e.classId === r.classId)?.level ?? 0;
}

/** Ресурсы персонажа с максимумом и потраченным, в порядке справочника. */
export function characterResources(c: Character, content: Content, sheet: CharacterSheet = computeSheet(c, content)): ResourceView[] {
  const have = new Set(sheet.features.map((f) => f.id));
  const out: ResourceView[] = [];
  for (const r of content.resources) {
    if (!r.features.some((id) => have.has(id))) continue;
    const ctx = { level: levelFor(r, c), sheet, classId: r.classId };
    if (r.minLevel && ctx.level < r.minLevel) continue;
    const max = evalFormula(r.max, ctx);
    if (max <= 0) continue;
    const short = r.shortWith && have.has(r.shortWith) ? 'all' : r.short;
    out.push({
      id: r.id,
      name: r.name,
      max,
      spent: Math.min(max, c.state.resourcesSpent[r.id] ?? 0),
      die: r.die ? evalFormula(r.die, ctx) || undefined : undefined,
      recovery: short === 'all' ? 'short' : short === 'one' ? 'short-one' : 'long',
    });
  }
  return out;
}

/** Потратить (delta > 0) или вернуть (delta < 0) использования ресурса в пределах 0…max. */
export function adjustResource(state: GameState, id: string, delta: number, max: number): GameState {
  const spent = Math.max(0, Math.min(max, (state.resourcesSpent[id] ?? 0) + delta));
  return { ...state, resourcesSpent: { ...state.resourcesSpent, [id]: spent } };
}

/** Короткий отдых: восстанавливает ресурсы, у которых это предусмотрено (всё или одно использование). */
export function shortRestResources(state: GameState, resources: ResourceView[]): GameState {
  const spent = { ...state.resourcesSpent };
  for (const r of resources) {
    if (!spent[r.id]) continue;
    if (r.recovery === 'short') spent[r.id] = 0;
    else if (r.recovery === 'short-one') spent[r.id] = Math.max(0, Math.min(r.max, spent[r.id] ?? 0) - 1);
  }
  return { ...state, resourcesSpent: spent };
}

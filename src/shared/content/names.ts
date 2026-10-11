// Названия записей справочника для подписей на экранах (русский, иначе английский).

import { COIN_ABBR, COIN_ORDER } from './constants';
import { byId, content, tr } from './content';
import type { AbilityId, Choice, ChoiceOption, Coin } from './types';

const proficiencyById = new Map(content.proficiencies.map((p) => [p.id, p]));
const spellById = new Map(content.spells.map((s) => [s.id, s]));

type Table = 'classes' | 'species' | 'subspecies' | 'backgrounds' | 'feats' | 'equipment' | 'languages' | 'skills' | 'features' | 'traits';

export function nameOf(table: Table, id: string | undefined): string {
  if (!id) return '';
  const entry = byId[table].get(id) as { name: Parameters<typeof tr>[0] } | undefined;
  return entry ? tr(entry.name).text : id;
}

export function proficiencyName(id: string): string {
  const p = proficiencyById.get(id);
  if (!p) return id;
  // Для навыков берём переведённое название навыка.
  if (p.type === 'skill' && p.refId) return nameOf('skills', p.refId);
  return tr(p.name).text;
}

export function spellName(id: string): string {
  const s = spellById.get(id);
  return s ? tr(s.name).text : id;
}

export function abilityAbbr(id: AbilityId): string {
  return tr(byId.abilities.get(id)?.abbr).text;
}

export function abilityName(id: AbilityId): string {
  return tr(byId.abilities.get(id)?.name).text;
}

export function coinsText(coins: Partial<Record<Coin, number>>): string {
  return COIN_ORDER.filter((c) => coins[c])
    .map((c) => `${coins[c]} ${COIN_ABBR[c]}`)
    .join(', ');
}

/** Текст варианта снаряжения: «Кожаный доспех, Кинжал ×2, …, 8 зм». */
export function equipmentOptionText(option: ChoiceOption): string {
  const one = (o: ChoiceOption): string => {
    switch (o.kind) {
      case 'item':
        return o.count > 1 ? `${nameOf('equipment', o.id)} ×${o.count}` : nameOf('equipment', o.id);
      case 'money':
        return `${o.amount} ${COIN_ABBR[o.unit]}`;
      case 'all':
        return o.items.map(one).join(', ');
      case 'choice':
        return choiceText(o.choice);
      default:
        return '';
    }
  };
  return one(option);
}

function choiceText(choice: Choice): string {
  if (choice.fromCategory) {
    const category = byId.equipmentCategories.get(choice.fromCategory);
    return `${category ? tr(category.name).text : choice.fromCategory} на выбор`;
  }
  return 'предмет на выбор';
}

/** Навыки по характеристикам (СИЛ, ЛОВ, ТЕЛ, ИНТ, МДР, ХАР), внутри — по алфавиту, как на бумажном листе. */
export function groupSkillsByAbility<T extends { id: string; ability: AbilityId }>(skills: T[]): { ability: AbilityId; skills: T[] }[] {
  const order: AbilityId[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  return order.map((ability) => ({
    ability,
    skills: skills
      .filter((s) => s.ability === ability)
      .sort((a, b) => nameOf('skills', a.id).localeCompare(nameOf('skills', b.id), 'ru')),
  }));
}

const magicItemById = new Map(content.magicItems.map((m) => [m.id, m]));

/** Название предмета инвентаря: снаряжение, магический предмет или свой предмет. */
export function itemName(item: { itemId: string; name?: string }): string {
  if (item.name) return item.name;
  const eq = byId.equipment.get(item.itemId);
  if (eq) return tr(eq.name).text;
  const magic = magicItemById.get(item.itemId);
  return magic ? tr(magic.name).text : item.itemId;
}

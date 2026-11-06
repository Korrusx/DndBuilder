// Что игрок выбрал на этом уровне — для чипов карты и сводки. Считается по разнице персонажа до и после
// повышения, как и `picked` в levelChoices: в колоде хранятся только числа.

import type { Character } from '@/entities/character';
import { classSpellLists, spellbook } from '@/entities/character';
import type { Content } from '@/shared/content';
import { indexOf, itemName, localizeText, nameOf, proficiencyName } from '@/shared/content';

import type { LevelChoice, PickedItem } from '../model/types';

/** Элементы `after`, которых нет в `before` (с повторами: две одинаковые черты — две). */
function added(before: string[], after: string[]): string[] {
  const rest = [...before];
  return after.filter((id) => {
    const i = rest.indexOf(id);
    if (i >= 0) {
      rest.splice(i, 1);
      return false;
    }
    return true;
  });
}

/** Название по id из любой таблицы, где хранятся варианты выбора. */
function anyName(id: string, content: Content): string {
  const idx = indexOf(content);
  if (idx.skills.has(id)) {
    return nameOf('skills', id);
  }
  if (idx.languages.has(id)) {
    return nameOf('languages', id);
  }
  if (idx.proficiencies.has(id)) {
    return proficiencyName(id);
  }
  const entry = idx.classOptions.get(id) ?? idx.features.get(id) ?? idx.feats.get(id) ?? idx.spells.get(id);
  if (entry) {
    return localizeText(entry.name).text;
  }
  return idx.equipment.has(id) ? itemName({ itemId: id }) : id;
}

const spellItem = (id: string, content: Content): PickedItem => {
  const spell = indexOf(content).spells.get(id);
  return { id, name: spell ? localizeText(spell.name).text : id, ...(spell?.level ? { circle: spell.level } : {}) };
};

export function pickedItems(choice: LevelChoice, prev: Character, next: Character, content: Content): PickedItem[] {
  const idx = indexOf(content);
  const named = (ids: string[], name: (id: string) => string) => ids.map((id) => ({ id, name: name(id) }));
  switch (choice.kind) {
    case 'subclass': {
      const id = next.classes.find((entry) => entry.classId === choice.classId)?.subclassId;
      const had = prev.classes.find((entry) => entry.classId === choice.classId)?.subclassId;
      return id && id !== had ? named([id], (sub) => localizeText(idx.subclasses.get(sub)?.name).text || sub) : [];
    }
    case 'feat':
    case 'fightingStyle': {
      const styles = (ids: string[]) =>
        ids.filter((id) => (idx.feats.get(id)?.type === 'fighting-style') === (choice.kind === 'fightingStyle'));
      const ids = added(styles(prev.feats.map((feat) => feat.featId)), styles(next.feats.map((feat) => feat.featId)));
      return named(ids, (id) => nameOf('feats', id));
    }
    case 'expertise':
      return named(added(prev.expertise, next.expertise), (id) => nameOf('skills', id));
    case 'languages':
      return named(added(prev.languages, next.languages), (id) => nameOf('languages', id));
    case 'masteries':
      return named(added(prev.weaponMasteries, next.weaponMasteries), (id) => itemName({ itemId: id }));
    case 'spells': {
      const before = classSpellLists(prev, content, choice.classId);
      const after = classSpellLists(next, content, choice.classId);
      return [...added(before.cantrips, after.cantrips), ...added(before.preparedSpells, after.preparedSpells)].map(
        (id) => spellItem(id, content),
      );
    }
    case 'spellbook':
      return added(spellbook(prev), spellbook(next)).map((id) => spellItem(id, content));
    default:
      return choice.key
        ? named(added(prev.choices[choice.key] ?? [], next.choices[choice.key] ?? []), (id) => anyName(id, content))
        : [];
  }
}

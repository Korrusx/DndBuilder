// Черновик без одного выбора уровня — основа предпросмотра «было → станет» (раздел 7.4).

import type { Character } from '@/entities/character';
import { classSpellLists, CHOICE_KEYS, setClassSpellLists } from '@/entities/character';
import type { Content } from '@/shared/content';
import { indexOf } from '@/shared/content';

import { clearLevelFeatChoices, levelFeat, levelUpPlan } from './levelup';
import type { LevelChoice } from './types';

/** Черновик `next`, в котором выбор `choice` вернули к состоянию до повышения (`prev`). */
export function withoutChoice(next: Character, prev: Character, choice: LevelChoice, content: Content): Character {
  const plan = levelUpPlan(next, content, choice.classId);
  switch (choice.kind) {
    case 'subclass':
      return {
        ...next,
        classes: next.classes.map((e) => (e.classId === choice.classId ? { ...e, subclassId: undefined } : e)),
      };
    case 'feat': {
      const feat = levelFeat(next, content, plan.charLevel);
      return { ...clearLevelFeatChoices(next, plan.charLevel), feats: next.feats.filter((f) => f !== feat) };
    }
    case 'expertise':
      return { ...next, expertise: prev.expertise };
    case 'fightingStyle':
      return {
        ...next,
        feats: next.feats.filter(
          (f) => !(f.level === plan.charLevel && indexOf(content).feats.get(f.featId)?.type === 'fighting-style'),
        ),
      };
    case 'languages':
      return { ...next, languages: prev.languages };
    case 'masteries':
      return { ...next, weaponMasteries: prev.weaponMasteries };
    case 'spells':
      return setClassSpellLists(next, content, choice.classId, classSpellLists(prev, content, choice.classId));
    case 'spellbook':
      return withKey(next, prev, CHOICE_KEYS.spellbook);
    default:
      return choice.key ? withKey(next, prev, choice.key) : next;
  }
}

function withKey(next: Character, prev: Character, key: string): Character {
  const { [key]: _drop, ...rest } = next.choices;
  return { ...next, choices: prev.choices[key] ? { ...rest, [key]: prev.choices[key] } : rest };
}

// Карточки описания на шагах «Класс» и «Предыстория и вид»: из справочника собирается готовая view-модель,
// экран её только рисует. Тексты — из справочника (короткие — data-pipeline/describe.json через перевод);
// нет короткого описания — первое предложение полного.

import type { AbilityId, Background, CharacterClass, Content, Feature, LocalizedText, Trait } from '@/shared/content';
import { indexOf, localizeText, plain } from '@/shared/content';
import { firstSentence } from '@/shared/lib/text';

import { DARKVISION_TRAITS, DEFAULT_CLASS_DIFFICULTY } from '../config/constants';
import { subclassLevel } from './build';
import { raceTraitIds } from './sheet';
import type { BackgroundDescription, ClassDescription, DescribedFeature, SpeciesDescription } from './types';

/** Сколько уровней показывать в «Что дальше». */
const NEXT_LEVELS = 3;

const text = (value: LocalizedText | undefined) => localizeText(value).text;

function described(
  entry: { id: string; name: LocalizedText; description: LocalizedText; summary?: LocalizedText },
  level?: number,
): DescribedFeature {
  const full = plain(entry.description);
  return {
    id: entry.id,
    name: text(entry.name),
    summary: entry.summary ? text(entry.summary) : firstSentence(full),
    text: full,
    ...(level && level > 1 ? { level } : {}),
  };
}

/** Умение «Увеличение характеристик» — в «Что дальше» не показываем. */
const isAbilityImprovement = (id: string) => id.includes('ability-score-improvement');

/** Выбор навыков: все варианты — навыки. */
function skillChoice(choices: CharacterClass['proficiencyChoices'], content: Content) {
  const idx = indexOf(content);
  const choice = choices.find(
    (c) =>
      c.options?.length && c.options.every((o) => o.kind === 'ref' && idx.proficiencies.get(o.id)?.type === 'skill'),
  );
  return choice
    ? { choose: choice.choose, options: (choice.options ?? []).flatMap((o) => (o.kind === 'ref' ? [o.id] : [])) }
    : undefined;
}

/**
 * Класс для карточки. `multiclass` — класс берётся вторым (при повышении уровня): сокращённые владения
 * и навыки из `class.multiclass`, спасбросков нет. `subclassId` — подкласс 1-го уровня (2014).
 */
export function describeClass(
  classId: string,
  content: Content,
  options: { multiclass?: boolean; subclassId?: string } = {},
): ClassDescription | undefined {
  const idx = indexOf(content);
  const cls = idx.classes.get(classId);
  if (!cls) {
    return undefined;
  }
  const features = (ids: string[]) =>
    ids.flatMap((id) => idx.features.get(id) ?? []).filter((f: Feature) => !f.parent && !f.subclassId);
  const subLevel = subclassLevel(cls.id, content);
  const next = cls.levels
    .slice(1)
    .map((row) => ({
      level: row.level,
      features: features(row.features)
        .filter((f) => !isAbilityImprovement(f.id))
        .map((f) => text(f.name)),
      subclass: row.level === subLevel,
    }))
    .filter((row) => row.features.length)
    .slice(0, NEXT_LEVELS);
  const proficiencies = options.multiclass ? cls.multiclass.proficiencies : cls.proficiencies;
  const sub = options.subclassId ? idx.subclasses.get(options.subclassId) : undefined;
  const skills = skillChoice(options.multiclass ? cls.multiclass.proficiencyChoices : cls.proficiencyChoices, content);
  return {
    id: cls.id,
    name: text(cls.name),
    role: text(cls.role),
    pitch: text(cls.pitch),
    difficulty: cls.difficulty ?? DEFAULT_CLASS_DIFFICULTY,
    extra: false,
    hitDie: cls.hitDie,
    primaryAbilities: cls.primaryAbilities,
    primaryAbilityChoice: cls.primaryAbilityChoice,
    savingThrows: options.multiclass ? [] : cls.savingThrows,
    armor: proficiencies.filter((id) => idx.proficiencies.get(id)?.type === 'armor'),
    firstLevel: features(cls.levels[0]?.features ?? []).map((f) => described(f)),
    next,
    ...(skills ? { skills } : {}),
    ...(sub && sub.classId === cls.id
      ? {
          subclass: {
            id: sub.id,
            name: text(sub.name),
            summary: text(sub.summary),
            features: sub.features
              .flatMap((id) => idx.features.get(id) ?? [])
              .filter((f) => f.level <= 1 && !f.parent)
              .map((f) => described(f)),
          },
        }
      : {}),
  };
}

/**
 * Вид / раса для карточки. `subspeciesId` — выбранная подраса: её особенности и прибавки добавляются,
 * заменённые ею особенности расы убираются. `variantTraitId` — выбранный вариант особенности (2014: драконий предок).
 */
export function describeSpecies(
  speciesId: string,
  content: Content,
  options: { subspeciesId?: string; variantTraitId?: string } = {},
): SpeciesDescription | undefined {
  const idx = indexOf(content);
  const species = idx.species.get(speciesId);
  if (!species) {
    return undefined;
  }
  const sub = options.subspeciesId ? idx.subspecies.get(options.subspeciesId) : undefined;
  const subOfSpecies = sub?.speciesId === species.id ? sub : undefined;
  const levels = new Map(subOfSpecies?.traits.map((t) => [t.id, t.level]) ?? []);
  const traitIds = raceTraitIds(species, subOfSpecies, 20);
  const variant = options.variantTraitId ? idx.traits.get(options.variantTraitId) : undefined;
  const traits: Trait[] = traitIds.flatMap((id) => {
    const trait = idx.traits.get(id);
    if (!trait) {
      return [];
    }
    // Вариант особенности вместо неё самой («Драконий предок (красный)»).
    return variant?.parent === id ? [variant] : [trait];
  });
  const darkvision = Math.max(0, ...traitIds.map((id) => DARKVISION_TRAITS[id] ?? 0));
  const bonuses = {
    ...(subOfSpecies?.replacesAbilityBonuses ? {} : species.abilityBonuses),
  } as Partial<Record<AbilityId, number>>;
  for (const [ability, bonus] of Object.entries(subOfSpecies?.abilityBonuses ?? {}) as [AbilityId, number][]) {
    bonuses[ability] = (bonuses[ability] ?? 0) + bonus;
  }
  return {
    id: species.id,
    name: text(species.name),
    pitch: text(species.pitch),
    extra: !!species.extra,
    sizes: species.sizes,
    speed: traits.reduce((speed, trait) => trait.speed ?? speed, species.speed),
    ...(darkvision ? { darkvision } : {}),
    ...(Object.keys(bonuses).length ? { abilityBonuses: bonuses } : {}),
    ...(species.abilityBonusChoice
      ? { abilityBonusChoice: { choose: species.abilityBonusChoice.choose, bonus: species.abilityBonusChoice.bonus } }
      : {}),
    traits: traits.map((trait) => described(trait, levels.get(trait.id))),
    languages: species.languages ?? [],
    ...(species.languageChoice ? { languageChoice: species.languageChoice.choose } : {}),
    ...(subOfSpecies ? { subspecies: { id: subOfSpecies.id, name: text(subOfSpecies.name) } } : {}),
  };
}

/**
 * Подходит ли предыстория классу: основные характеристики класса среди характеристик предыстории
 * (в порядке класса). Пусто — не подходит; в 2014 у предысторий характеристик нет.
 */
export function backgroundFits(background: Background, cls: CharacterClass | undefined): AbilityId[] {
  return cls ? cls.primaryAbilities.filter((ability) => background.abilities.includes(ability)) : [];
}

/** Предыстории в порядке справочника: сначала подходящие классу, потом остальные. */
export function backgroundsForClass(
  content: Content,
  classId: string | undefined,
): { fitting: string[]; other: string[] } {
  const cls = classId ? indexOf(content).classes.get(classId) : undefined;
  const fitting: string[] = [];
  const other: string[] = [];
  for (const background of content.backgrounds) {
    (backgroundFits(background, cls).length ? fitting : other).push(background.id);
  }
  return { fitting, other };
}

/** Предыстория для карточки; `classId` — выбранный класс (для подсказки «Подходит плуту»). */
export function describeBackground(
  backgroundId: string,
  content: Content,
  classId?: string,
): BackgroundDescription | undefined {
  const idx = indexOf(content);
  const background = idx.backgrounds.get(backgroundId);
  if (!background) {
    return undefined;
  }
  const feat = background.featId ? idx.feats.get(background.featId) : undefined;
  const isSkill = (id: string) => idx.proficiencies.get(id)?.type === 'skill';
  const fit = backgroundFits(background, classId ? idx.classes.get(classId) : undefined)[0];
  return {
    id: background.id,
    name: text(background.name),
    pitch: text(background.pitch),
    extra: !!background.extra,
    abilities: background.abilities,
    ...(feat ? { feat: described(feat) } : {}),
    skills: background.proficiencies.filter(isSkill),
    tools: background.proficiencies.filter((id) => !isSkill(id)),
    toolChoices: background.proficiencyChoices.map((choice) => text(choice.desc)).filter(Boolean),
    equipment: text(background.equipment[0]?.desc),
    ...(background.languageChoice ? { languages: background.languageChoice.choose } : {}),
    ...(background.feature
      ? {
          feature: described({
            id: `${background.id}-feature`,
            name: background.feature.name,
            description: background.feature.description,
          }),
        }
      : {}),
    ...(fit && classId ? { fit: { classId, ability: fit } } : {}),
  };
}

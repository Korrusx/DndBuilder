import type { Species, Trait } from '@/shared/content';
import { byId, content, localizeText } from '@/shared/content';
import { i18n } from '@/shared/i18n';

import type { VariantOption } from '@/shared/ui';
import { bonusText, shortSubspeciesName, subspeciesSummary } from './subspeciesText';

/**
 * 2014: особенность расы с вариантами на выбор («Драконий предок» драконорождённого) — выбирается в панели
 * под карточкой расы, как подраса.
 */
export function speciesVariantTrait(species: Species): Trait | undefined {
  if (species.subspecies.length) {
    return undefined;
  }
  return species.traits.flatMap((id) => byId.traits.get(id) ?? []).find((trait) => trait.subtraits?.length);
}

/** «Драконий предок (чёрный)» → «Чёрный». */
function shortVariantName(name: string): string {
  const inner = /\(([^)]+)\)\s*$/.exec(name)?.[1] ?? name;
  return inner.charAt(0).toUpperCase() + inner.slice(1);
}

/** Строки панели: подрасы расы или варианты её особенности. */
export function variantOptions(species: Species): VariantOption[] {
  if (species.subspecies.length) {
    return species.subspecies.flatMap((id) => {
      const sub = byId.subspecies.get(id);
      if (!sub) {
        return [];
      }
      const { traits, description } = subspeciesSummary(sub);
      return [{ id, name: shortSubspeciesName(id), bonuses: bonusText(sub.abilityBonuses), traits, description }];
    });
  }
  const parent = speciesVariantTrait(species);
  return (parent?.subtraits ?? []).flatMap((id) => {
    const trait = byId.traits.get(id);
    if (!trait) {
      return [];
    }
    const damage = content.damageTypes.find((d) => d.id === trait.damageType);
    const description = localizeText(trait.description).text;
    return [
      {
        id,
        name: shortVariantName(localizeText(trait.name).text),
        traits: damage ? i18n.t('origin.damageType', { type: localizeText(damage.name).text }) : undefined,
        // В английском SRD у вариантов общий текст особенности — его не повторяем.
        description: description !== localizeText(parent!.description).text ? description : undefined,
      },
    ];
  });
}

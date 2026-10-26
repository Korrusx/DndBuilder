// Варианты выбора с описаниями для строк ChoiceRow и шторки DetailSheet:
// черты, умения, воззвания и метамагия, языки, приёмы оружия, виды, предыстории, предметы.

import type { ClassOption, Content, Feat, LocalizedText } from '@/shared/content';
import { abilityAbbr, coinAbbr, indexOf, localizeText, plain, proficiencyName, sizeName } from '@/shared/content';
import { currentLanguage, t } from '@/shared/i18n';
import { formatDice, formatFeet } from '@/shared/lib/dice';
import type { ChoiceEntry, DetailContent, PickFilter } from '@/shared/ui';

import type { FeatureOption } from '../model/types';

/**
 * Короткая сводка описания: заголовки абзацев «**Мастерство в инициативе.** …» через « · »,
 * а если их нет — первое предложение.
 */
export function descriptionSummary(text: LocalizedText | undefined): string {
  const raw = localizeText(text).text;
  const headings = [...raw.matchAll(/\*\*([^*]+?)\*\*/g)].map((m) => m[1].trim().replace(/[.:]$/, ''));
  if (headings.length) {
    return headings.join(' · ');
  }
  return plain(text).split(/(?<=[.!?])\s/)[0] ?? '';
}

/** Сортировка вариантов по названию на текущем языке. */
function byTitle(entries: ChoiceEntry[]): ChoiceEntry[] {
  return [...entries].sort((a, b) => a.title.localeCompare(b.title, currentLanguage()));
}

function entry(
  id: string,
  name: LocalizedText,
  summary: string,
  detail: Omit<DetailContent, 'title'>,
  extra?: Partial<ChoiceEntry>,
): ChoiceEntry {
  const title = localizeText(name).text;
  return {
    id,
    title,
    summary,
    search: [name.en, name.ru].filter(Boolean).join(' '),
    detail: { title, ...detail },
    ...extra,
  };
}

function featPrerequisite(feat: Feat): string | undefined {
  const parts = [
    ...(feat.prerequisites?.minLevel ? [t('choiceDetail.minLevel', { level: feat.prerequisites.minLevel })] : []),
    ...(feat.prerequisites?.spellcasting ? [t('choiceDetail.spellcasting')] : []),
    ...(feat.prerequisites?.proficiency ? [proficiencyName(feat.prerequisites.proficiency)] : []),
  ];
  return parts.length ? t('choiceDetail.prerequisite', { text: parts.join(', ') }) : undefined;
}

/** Черты: тип и условие в подзаголовке, сводка — заголовки преимуществ. */
export function featEntries(ids: string[], content: Content): ChoiceEntry[] {
  const feats = indexOf(content).feats;
  return byTitle(
    ids.flatMap((id) => {
      const feat = feats.get(id);
      if (!feat) {
        return [];
      }
      const prerequisite = featPrerequisite(feat);
      return [
        entry(feat.id, feat.name, descriptionSummary(feat.description), {
          subtitle: [t(`choiceDetail.featType.${feat.type}`), prerequisite].filter(Boolean).join(' · '),
          tags: [
            ...(feat.repeatable ? [t('choiceDetail.repeatable')] : []),
            ...(feat.extra ? [t('choiceDetail.fromPhb')] : []),
          ],
          text: plain(feat.description),
        }),
      ];
    }),
  );
}

/** Умения класса как варианты (2014: стиль боя, договор и т.п.). */
export function featureEntries(ids: string[], content: Content): ChoiceEntry[] {
  const features = indexOf(content).features;
  return byTitle(
    ids.flatMap((id) => {
      const feature = features.get(id);
      return feature
        ? [
            entry(feature.id, feature.name, descriptionSummary(feature.description), {
              text: plain(feature.description),
            }),
          ]
        : [];
    }),
  );
}

/** Варианты умения с выбором («Божественный порядок», «Первобытный порядок»): порядок как в данных. */
export function featureOptionEntries(options: FeatureOption[]): ChoiceEntry[] {
  return options.map((option) =>
    entry(option.id, option.name, descriptionSummary(option.description), { text: plain(option.description) }),
  );
}

function classOptionPrerequisite(option: ClassOption, content: Content): string | undefined {
  const req = option.prerequisite;
  const parts = [
    ...(req?.level ? [t('choiceDetail.classLevel', { level: req.level })] : []),
    ...(req?.invocation
      ? [localizeText(content.classOptions.find((o) => o.id === req.invocation)?.name).text || req.invocation]
      : []),
    ...(req?.cantrip ? [t(`choiceDetail.needCantrip.${req.cantrip}`)] : []),
  ];
  return parts.length ? t('choiceDetail.prerequisite', { text: parts.join(', ') }) : undefined;
}

/** Воззвания и метамагия: условие и стоимость в подзаголовке. */
export function classOptionEntries(options: ClassOption[], content: Content): ChoiceEntry[] {
  return options.map((option) => {
    const prerequisite = classOptionPrerequisite(option, content);
    const cost = option.cost ? t('choiceDetail.cost', { count: option.cost }) : undefined;
    return entry(option.id, option.name, [cost, descriptionSummary(option.description)].filter(Boolean).join(' · '), {
      subtitle: [t(`choiceDetail.classOption.${option.kind}`), prerequisite].filter(Boolean).join(' · '),
      tags: option.repeatable ? [t('choiceDetail.repeatable')] : [],
      text: plain(option.description),
    });
  });
}

/** Языки: стандартный или редкий, пояснение. */
export function languageEntries(ids: string[], content: Content): ChoiceEntry[] {
  const languages = indexOf(content).languages;
  return byTitle(
    ids.flatMap((id) => {
      const language = languages.get(id);
      if (!language) {
        return [];
      }
      const kind = language.rare ? t('choiceDetail.language.rare') : t('choiceDetail.language.standard');
      return [
        entry(
          language.id,
          language.name,
          kind,
          { subtitle: kind, text: plain(language.note) || kind },
          {
            filters: [language.rare ? 'rare' : 'standard'],
          },
        ),
      ];
    }),
  );
}

/** Фильтры языков: стандартные и редкие. */
export function languageFilters(): PickFilter[] {
  return [
    { key: 'standard', label: t('choiceDetail.language.standard'), group: 'rarity' },
    { key: 'rare', label: t('choiceDetail.language.rare'), group: 'rarity' },
  ];
}

/** Урон оружия: «1к8 рубящий». */
function weaponDamage(dice: string, type: string, content: Content): string {
  const typeName = localizeText(content.damageTypes.find((d) => d.id === type)?.name).text || type;
  return `${formatDice(dice)} ${typeName}`;
}

/** Приёмы оружия: в сводке — приём и урон, в шторке — плитки оружия и описание приёма. */
export function masteryEntries(weaponIds: string[], content: Content): ChoiceEntry[] {
  const equipment = indexOf(content).equipment;
  return byTitle(
    weaponIds.flatMap((id) => {
      const item = equipment.get(id);
      const weapon = item?.weapon;
      if (!item || !weapon) {
        return [];
      }
      const mastery = content.weaponMasteries.find((m) => m.id === weapon.mastery);
      const masteryName = localizeText(mastery?.name).text;
      const damage = weapon.damage ? weaponDamage(weapon.damage.dice, weapon.damage.type, content) : '';
      const properties = weapon.properties
        .map((p) => localizeText(content.weaponProperties.find((w) => w.id === p)?.name).text || p)
        .join(', ');
      const reach = weapon.reach.long
        ? `${weapon.reach.normal}/${formatFeet(weapon.reach.long)}`
        : formatFeet(weapon.reach.normal);
      return [
        entry(item.id, item.name, [masteryName, damage].filter(Boolean).join(' · '), {
          subtitle: masteryName ? t('choiceDetail.mastery', { name: masteryName }) : undefined,
          tiles: [
            ...(damage ? [{ label: t('choiceDetail.damage'), value: damage }] : []),
            { label: t('choiceDetail.range'), value: reach },
            { label: t('choiceDetail.properties'), value: properties || t('choiceDetail.none') },
          ],
          text: plain(mastery?.description),
        }),
      ];
    }),
  );
}

/** Виды: скорость, размер, особенности (каждая — разделом в шторке). */
export function speciesEntries(content: Content): ChoiceEntry[] {
  const traits = indexOf(content).traits;
  return content.species.map((species) => {
    const sizes = species.sizes.map(sizeName).join(` ${t('common.or')} `);
    const summary = [
      formatFeet(species.speed),
      sizes,
      ...(species.subspecies.length ? [t('origin.variants', { count: species.subspecies.length })] : []),
    ].join(' · ');
    return entry(species.id, species.name, summary, {
      tiles: [
        { label: t('choiceDetail.speed'), value: formatFeet(species.speed) },
        { label: t('choiceDetail.size'), value: sizes },
      ],
      tags: species.extra ? [t('choiceDetail.fromPhb')] : [],
      text: '',
      sections: species.traits.flatMap((id) => {
        const trait = traits.get(id);
        return trait ? [{ title: localizeText(trait.name).text, text: plain(trait.description) }] : [];
      }),
    });
  });
}

/** Особенности на выбор («Наследие драконов»). */
export function traitEntries(ids: string[], content: Content): ChoiceEntry[] {
  const traits = indexOf(content).traits;
  return ids.flatMap((id) => {
    const trait = traits.get(id);
    return trait
      ? [entry(trait.id, trait.name, descriptionSummary(trait.description), { text: plain(trait.description) })]
      : [];
  });
}

/** Предыстории: характеристики, черта, владения; описание черты — разделом в шторке. */
export function backgroundEntries(content: Content): ChoiceEntry[] {
  const feats = indexOf(content).feats;
  return byTitle(
    content.backgrounds.map((background) => {
      const feat = background.featId ? feats.get(background.featId) : undefined;
      const abilities = background.abilities.map(abilityAbbr).join(', ');
      const proficiencies = background.proficiencies.map(proficiencyName).join(', ');
      return entry(
        background.id,
        background.name,
        [abilities, feat ? localizeText(feat.name).text : undefined, proficiencies].filter(Boolean).join(' · '),
        {
          tiles: [
            ...(abilities ? [{ label: t('choiceDetail.abilities'), value: abilities }] : []),
            ...(feat ? [{ label: t('choiceDetail.feat'), value: localizeText(feat.name).text }] : []),
            ...(proficiencies ? [{ label: t('choiceDetail.proficiencies'), value: proficiencies }] : []),
          ],
          tags: background.extra ? [t('choiceDetail.fromPhb')] : [],
          text: '',
          sections: [
            ...(feat ? [{ title: localizeText(feat.name).text, text: plain(feat.description) }] : []),
            ...(background.feature
              ? [{ title: localizeText(background.feature.name).text, text: plain(background.feature.description) }]
              : []),
          ],
        },
      );
    }),
  );
}

/** Снаряжение из справочника: цена, вес, урон или КЗ, описание. */
export function equipmentEntries(ids: string[], content: Content): ChoiceEntry[] {
  const equipment = indexOf(content).equipment;
  return ids.flatMap((id) => {
    const item = equipment.get(id);
    if (!item) {
      return [];
    }
    const cost = `${item.cost.amount} ${coinAbbr(item.cost.unit)}`;
    const damage = item.weapon?.damage ? weaponDamage(item.weapon.damage.dice, item.weapon.damage.type, content) : '';
    const armorClass = item.armor ? (item.armor.category === 'shield' ? '+2' : String(item.armor.base)) : '';
    return [
      entry(
        item.id,
        item.name,
        [damage || (armorClass && `${t('choiceDetail.armorClass')} ${armorClass}`), cost].filter(Boolean).join(' · '),
        {
          tiles: [
            { label: t('choiceDetail.cost2'), value: cost },
            ...(item.weight
              ? [{ label: t('choiceDetail.weight'), value: t('inventory.weight', { val: item.weight }) }]
              : []),
            ...(damage ? [{ label: t('choiceDetail.damage'), value: damage }] : []),
            ...(armorClass ? [{ label: t('choiceDetail.armorClass'), value: armorClass }] : []),
          ],
          text: plain(item.description),
        },
      ),
    ];
  });
}

/** Магические предметы: вид, редкость, настройка, описание. */
export function magicItemEntries(ids: string[], content: Content): ChoiceEntry[] {
  const items = indexOf(content).magicItems;
  return ids.flatMap((id) => {
    const item = items.get(id);
    if (!item) {
      return [];
    }
    const rarity = localizeText(item.rarity).text;
    return [
      entry(item.id, item.name, [rarity, localizeText(item.kind).text].filter(Boolean).join(' · '), {
        subtitle: localizeText(item.kind).text,
        tiles: [{ label: t('choiceDetail.rarity'), value: rarity }],
        tags: item.attunement ? [t('choiceDetail.attunement')] : [],
        text: plain(item.description),
      }),
    ];
  });
}

/** Описание черты для шторки (например, к выбранной черте в списке умений). */
export function featDetail(id: string, content: Content): DetailContent | null {
  return featEntries([id], content)[0]?.detail ?? null;
}

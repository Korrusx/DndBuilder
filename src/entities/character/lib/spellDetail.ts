import type { Content, Spell } from '@/shared/content';
import { localizeText, plain } from '@/shared/content';
import { t } from '@/shared/i18n';
import { formatFeet } from '@/shared/lib/dice';
import type { DetailContent } from '@/shared/ui';

import { totalLevel } from '../model/character';
import { spellDamageText } from '../model/spellSummary';
import type { Character } from '../model/types';

/** Описание заклинания для шторки: круг и школа, плитки (время, дистанция, компоненты, длительность, урон), текст. */
export function spellDetail(spell: Spell, content: Content, character?: Character): DetailContent {
  const school = content.magicSchools.find((s) => s.id === spell.school);
  const circle = spell.level === 0 ? t('spell.cantrip') : t('spell.circle', { level: spell.level });
  const area = spell.area
    ? t(`spellSummary.area.${spell.area.shape}`, { size: formatFeet(spell.area.size) })
    : undefined;
  const components = spell.components.map((c) => t(`spellDetail.component.${c}`)).join(', ');
  const material = spell.material ? localizeText(spell.material).text : '';
  const damage = spellDamageText(spell, character ? totalLevel(character.classes) : 1);
  const higherLevel = plain(spell.higherLevel);
  return {
    title: localizeText(spell.name).text,
    subtitle: [circle, school ? localizeText(school.name).text : spell.school].join(' · '),
    tags: [
      ...(spell.concentration ? [t('spellDetail.concentration')] : []),
      ...(spell.ritual ? [t('spellDetail.ritual')] : []),
    ],
    tiles: [
      { label: t('spellDetail.time'), value: localizeText(spell.castingTime).text },
      { label: t('spellDetail.range'), value: [localizeText(spell.range).text, area].filter(Boolean).join(', ') },
      { label: t('spellDetail.components'), value: material ? `${components} (${material})` : components },
      { label: t('spellDetail.duration'), value: localizeText(spell.duration).text },
      ...(damage
        ? [{ label: spell.damage?.kind ? t('spellDetail.effect') : t('spellDetail.damage'), value: damage }]
        : []),
    ],
    text: plain(spell.description),
    sections: higherLevel
      ? [
          {
            title: spell.level === 0 ? t('spellDetail.cantripUpgrade') : t('spellDetail.higherLevels'),
            text: higherLevel,
          },
        ]
      : [],
  };
}

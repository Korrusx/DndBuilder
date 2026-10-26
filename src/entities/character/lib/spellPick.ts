import type { Content } from '@/shared/content';
import { indexOf, localizeText } from '@/shared/content';
import { currentLanguage, t } from '@/shared/i18n';
import type { PickFilter, PickItem } from '@/shared/ui';

import { spellSummary } from '../model/spellSummary';
import type { Character } from '../model/types';

/** Вид заклинания для фильтра: урон, лечение или поддержка (без урона, атаки и спасброска). */
function spellKind(spell: Content['spells'][number]): 'damage' | 'heal' | 'support' | null {
  if (spell.damage) {
    return spell.damage.kind ? 'heal' : 'damage';
  }
  return spell.attackType || spell.save ? null : 'support';
}

/**
 * Заклинания для полноэкранного выбора: название, сводка, метки «К»/«Р», ключи фильтров.
 * Порядок — по кругу, внутри круга по названию. `blocked` — уже выбранные в другом месте (с причиной).
 */
export function spellPickItems(
  ids: string[],
  content: Content,
  character?: Character,
  blocked?: Map<string, string>,
): PickItem[] {
  const spells = indexOf(content).spells;
  return ids
    .map((id) => spells.get(id))
    .filter((spell) => !!spell)
    .map((spell) => {
      const summary = spellSummary(spell, content, character);
      const kind = spellKind(spell);
      return {
        level: spell.level,
        item: {
          id: spell.id,
          title: localizeText(spell.name).text,
          summary: summary.text,
          tags: summary.tags.map((tag) =>
            tag === 'concentration' ? t('magic.concentrationBadge') : t('magic.ritualBadge'),
          ),
          reason: blocked?.get(spell.id),
          filters: [...(kind ? [kind] : []), ...summary.tags, `circle-${spell.level}`],
          search: [spell.name.en, spell.name.ru].filter(Boolean).join(' '),
        },
      };
    })
    .sort((a, b) => a.level - b.level || a.item.title.localeCompare(b.item.title, currentLanguage()))
    .map(({ item }) => item);
}

/** Фильтры, под которые подходит хотя бы одно заклинание; круги — только если их в списке несколько. */
export function spellPickFilters(items: PickItem[]): PickFilter[] {
  const present = new Set(items.flatMap((item) => item.filters ?? []));
  const filters: PickFilter[] = (['damage', 'heal', 'support', 'concentration', 'ritual'] as const)
    .filter((key) => present.has(key))
    .map((key) => ({
      key,
      label: t(`picker.filter.${key}`),
      group: key === 'concentration' || key === 'ritual' ? key : 'kind',
    }));
  const circles = [...present]
    .filter((key) => key.startsWith('circle-'))
    .map((key) => Number(key.slice('circle-'.length)))
    .sort((a, b) => a - b);
  if (circles.length > 1) {
    for (const level of circles) {
      filters.push({
        key: `circle-${level}`,
        label: level === 0 ? t('spell.cantrip') : t('spell.circle', { level }),
        group: 'circle',
      });
    }
  }
  return filters;
}

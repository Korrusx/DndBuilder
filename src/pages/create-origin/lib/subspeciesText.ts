import type { AbilityBonuses, AbilityId, Subspecies } from '@/shared/content';
import { abilityAbbr, byId, nameOf, tr } from '@/shared/content';
import { i18n } from '@/shared/i18n';

/** «ЛОВ +2, ХАР +1». */
export const bonusText = (b: AbilityBonuses | undefined) =>
  Object.entries(b ?? {})
    .map(([id, v]) => `${abilityAbbr(id as AbilityId)} +${v}`)
    .join(', ');

/** «Родословная: дроу» → «Дроу»: внутри панели вида приставка лишняя. */
export function shortSubspeciesName(id: string): string {
  const name = nameOf('subspecies', id);
  const tail = name.includes(': ') ? name.slice(name.indexOf(': ') + 2) : name;
  return tail.charAt(0).toUpperCase() + tail.slice(1);
}

/**
 * Что даёт разновидность: умения по названиям (с какого уровня, если не с 1-го).
 * Если умение одно, вместо названия — его описание: у голиафа и шифтера название повторяет саму разновидность.
 */
export function subspeciesSummary(sub: Subspecies): { traits: string; description?: string } {
  const traits = sub.traits.flatMap((st) => byId.traits.get(st.id) ?? []);
  if (traits.length === 1) return { traits: '', description: tr(traits[0].description).text };
  const own = nameOf('subspecies', sub.id);
  return {
    traits: sub.traits
      .filter((st) => nameOf('traits', st.id) !== own)
      .map((st) => (st.level > 1 ? i18n.t('origin.atLevel', { name: nameOf('traits', st.id), level: st.level }) : nameOf('traits', st.id)))
      .join(', '),
  };
}

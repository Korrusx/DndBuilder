import type { Content, Spell } from '@/shared/content';
import { abilityAbbr, localizeText } from '@/shared/content';
import { t } from '@/shared/i18n';
import { formatDamage, formatFeet } from '@/shared/lib/dice';

import { totalLevel } from './character';
import { spellDamage } from './spells';
import type { Character, SpellSummary } from './types';

/** «1к10 огнём», «лечение 2к8 + мод.», «2 × 1к10 силовым полем». */
export function spellDamageText(spell: Spell, characterLevel: number): string | null {
  const damage = spellDamage(spell, characterLevel);
  if (!damage) {
    return null;
  }
  let dice = formatDamage(damage.dice, damage.bonus);
  if (damage.addModifier) {
    dice = `${dice} ${t('spellSummary.modifier')}`;
  }
  if (damage.beams && damage.beams > 1) {
    dice = t('spellSummary.beams', { count: damage.beams, dice });
  }
  if (damage.kind === 'heal') {
    return t('spellSummary.heal', { dice });
  }
  if (damage.kind === 'tempHp') {
    return t('spellSummary.tempHp', { dice });
  }
  if (damage.chosenType || !spell.damage?.type) {
    return damage.chosenType ? t('spellSummary.chosenType', { dice }) : dice;
  }
  return t(`spellSummary.damage.${spell.damage.type}` as 'spellSummary.damage.fire', { dice });
}

/**
 * Короткая строка о заклинании для списка выбора: «1к10 огнём · атака · 120 фт», «3к6 огнём · СЛ спасброска ЛОВ · конус 15 фт».
 * Собирается из урона, атаки/спасброска и области (иначе дистанции). Если ничего из этого нет — `short` из перевода,
 * иначе школа и время накладывания. С персонажем урон заговора — по его уровню, без него — как на 1-м уровне.
 */
export function spellSummary(spell: Spell, content: Content, character?: Character): SpellSummary {
  const tags: SpellSummary['tags'] = [
    ...(spell.concentration ? (['concentration'] as const) : []),
    ...(spell.ritual ? (['ritual'] as const) : []),
  ];
  const damage = spellDamageText(spell, character ? totalLevel(character.classes) : 1);
  const check = spell.attackType
    ? t('spellSummary.attack')
    : spell.save
      ? t('spellSummary.save', { ability: abilityAbbr(spell.save) })
      : null;
  if (damage || check) {
    const reach = spell.area
      ? t(`spellSummary.area.${spell.area.shape}`, { size: formatFeet(spell.area.size) })
      : localizeText(spell.range).text;
    return { text: [damage, check, reach].filter(Boolean).join(' · '), tags };
  }
  if (spell.short) {
    return { text: localizeText(spell.short).text, tags };
  }
  const school = content.magicSchools.find((s) => s.id === spell.school);
  return {
    text: [school ? localizeText(school.name).text : spell.school, localizeText(spell.castingTime).text]
      .filter(Boolean)
      .join(' · '),
    tags,
  };
}

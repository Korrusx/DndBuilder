import { useMemo } from 'react';

import type { Character } from '@/entities/character';
import { computeSheet, proficientSkills } from '@/entities/character';
import type { PreviewOption } from '@/features/level-up';
import { levelUpPlan, PreviewPick } from '@/features/level-up';
import { abilityAbbr, byId, content, nameOf, proficiencyName } from '@/shared/content';
import { t } from '@/shared/i18n';
import { formatModifier } from '@/shared/lib/dice';

import type { EditorProps } from './editors.types';

/** id навыка из id владения («skill-stealth» → «stealth»); не навык — undefined. */
const skillOf = (id: string) => {
  const p = byId.proficiencies.get(id);
  return p?.type === 'skill' ? p.refId : byId.skills.has(id) ? id : undefined;
};

/**
 * Навыки с примеркой (макет У4): компетентность, навыки от умения, владения нового класса.
 * Справа — как изменится бонус навыка, если выбрать вариант.
 */
export function SkillsEditor({ choice, prev, next, set }: EditorProps) {
  const plan = levelUpPlan(next, content, choice.classId);
  const isExpertise = choice.kind === 'expertise';
  const key = choice.key ?? '';
  const options: string[] = isExpertise
    ? proficientSkills(next, content).filter((s) => !prev.expertise.includes(s))
    : choice.kind === 'multiclassProficiency'
      ? (plan.multiclassChoices.find((mc) => mc.key === key)?.options ?? [])
      : (plan.skillChoices.find((sc) => sc.key === key)?.options ?? []);
  const selected = isExpertise ? next.expertise.filter((s) => !prev.expertise.includes(s)) : (next.choices[key] ?? []);
  const owned = new Set(proficientSkills(prev, content));

  const apply = (c: Character, ids: string[]): Character =>
    isExpertise ? { ...c, expertise: [...prev.expertise, ...ids] } : { ...c, choices: { ...c.choices, [key]: ids } };

  const rows: PreviewOption[] = useMemo(
    () =>
      options.map((id) => {
        const skill = skillOf(id);
        const title = skill ? nameOf('skills', skill) : proficiencyName(id);
        const ability = skill ? byId.skills.get(skill)?.ability : undefined;
        const disabled = !isExpertise && !!skill && owned.has(skill);
        if (!skill || disabled) {
          return { id, title, hint: disabled ? t('levelUpPage.owned') : undefined, disabled };
        }
        const without = selected.filter((x) => x !== id);
        const bonus = (c: Character) => computeSheet(c, content).skills.find((s) => s.id === skill)?.bonus ?? 0;
        return {
          id,
          title,
          hint: ability ? abilityAbbr(ability) : undefined,
          before: formatModifier(bonus(apply(next, without))),
          after: formatModifier(bonus(apply(next, [...without, id]))),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [next, prev, choice.id],
  );

  return (
    <PreviewPick options={rows} selected={selected} max={choice.count} onChange={(ids) => set((c) => apply(c, ids))} />
  );
}

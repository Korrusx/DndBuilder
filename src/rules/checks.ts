// Спасброски, навыки, пассивные значения.

/** Спасбросок = мод + (владение ? БМ : 0). */
export function savingThrow(mod: number, proficient: boolean, profBonus: number): number {
  return mod + (proficient ? profBonus : 0);
}

/** Навык = мод + (владение ? БМ : 0) + (компетентность ? БМ : 0). */
export function skillBonus(mod: number, proficient: boolean, expertise: boolean, profBonus: number): number {
  return mod + (proficient ? profBonus : 0) + (expertise ? profBonus : 0);
}

/** Пассивное значение = 10 + бонус навыка (пассивное восприятие = 10 + Восприятие). */
export function passiveScore(skill: number): number {
  return 10 + skill;
}

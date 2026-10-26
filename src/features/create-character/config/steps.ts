// Шаги мастера создания; название шага — t(`wizard.steps.${id}`).
export const CREATE_STEPS = [
  { route: '/create/class', id: 'class' },
  { route: '/create/origin', id: 'origin' },
  { route: '/create/abilities', id: 'abilities' },
  { route: '/create/skills', id: 'skills' },
  { route: '/create/equipment', id: 'equipment' },
  { route: '/create/review', id: 'review' },
] as const;

/** На сколько шагов позади текущего шаг замораживается (шаг прямо под текущим остаётся живым). */
export const FROZEN_STEP_DEPTH = 2;

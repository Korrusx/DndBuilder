import type { ResourceRecovery } from '@/entities/character';

/** Больше стольких использований — показываем счётчик вместо кружков. */
export const MAX_DOTS = 10;

export const RECOVERY: Record<ResourceRecovery, string> = {
  long: 'долгий отдых',
  short: 'короткий отдых',
  'short-one': '1 за короткий отдых, все за долгий',
};

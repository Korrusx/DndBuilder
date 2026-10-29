import type { Character } from '@/entities/character';

/** Вкладки экрана кампании. */
export type CampaignTab = 'chronicle' | 'people' | 'places' | 'quests';

/** Персонажи кампании по id (из таблицы персонажей). */
export type CharactersById = ReadonlyMap<string, Character>;

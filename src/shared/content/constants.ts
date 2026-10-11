import type { Coin } from './types';

/** Монеты от меньшей к большей. */
export const COIN_ORDER: Coin[] = ['cp', 'sp', 'ep', 'gp', 'pp'];

/** Сокращения монет: «зм», «см»… */
export const COIN_ABBR: Record<Coin, string> = { cp: 'мм', sp: 'см', ep: 'эм', gp: 'зм', pp: 'пм' };

export const COIN_NAMES: Record<Coin, string> = { cp: 'Медные', sp: 'Серебряные', ep: 'Электрум', gp: 'Золотые', pp: 'Платиновые' };

/** Размеры существ из справочника (английские значения) по-русски. */
export const SIZE_NAMES: Record<string, string> = { Small: 'Маленький', Medium: 'Средний', Large: 'Большой' };

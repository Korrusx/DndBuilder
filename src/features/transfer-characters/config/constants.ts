export const EXCHANGE_FORMAT = 'dnd-builder/characters';

/** Версия формата файла. Повышается, если файл перестанет читаться старым способом. */
export const EXCHANGE_VERSION = 1;

/** Больше такого размера файл не читаем: наш файл с сотней персонажей весит меньше мегабайта. */
export const EXCHANGE_MAX_BYTES = 5 * 1024 * 1024;

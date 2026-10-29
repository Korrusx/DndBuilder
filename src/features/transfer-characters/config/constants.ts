export const EXCHANGE_FORMAT = 'dnd-builder/characters';

/** Версия формата файла. Повышается, если файл перестанет читаться старым способом. */
export const EXCHANGE_VERSION = 1;

/** Больше такого размера файл не читаем: сотня персонажей весит меньше мегабайта, хроника с фото — десятки. */
export const EXCHANGE_MAX_BYTES = 64 * 1024 * 1024;

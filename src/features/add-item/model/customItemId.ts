import { CUSTOM_ITEM_PREFIX } from '@/entities/character';

/** Id своего предмета (не из справочника): уникален по времени добавления. */
export const customItemId = () => `${CUSTOM_ITEM_PREFIX}${Date.now().toString(36)}`;

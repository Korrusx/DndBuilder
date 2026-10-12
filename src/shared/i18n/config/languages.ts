import type { Language } from '../model/types';

/** Язык по умолчанию: русский. */
export const DEFAULT_LANGUAGE: Language = 'ru';

/** Языки в переключателе; названия — на своём языке. */
export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

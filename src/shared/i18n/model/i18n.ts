// Язык приложения: i18next хранит текущий язык и словари интерфейса (locales/*.json).
// Тексты справочника переводятся отдельно (shared/content, tr) — по тому же текущему языку.

import 'intl-pluralrules';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE } from '../config/languages';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import type { Language } from './types';

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en } },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  // React сам экранирует текст.
  interpolation: { escapeValue: false },
});

export { i18n };

/** Перевод строки интерфейса по ключу — для кода вне React (в компонентах — useTranslation). */
export const t = i18n.t.bind(i18n);

export const isLanguage = (v: unknown): v is Language => v === 'ru' || v === 'en';

/** Текущий язык (для кода вне React: справочник, PDF). */
export function currentLanguage(): Language {
  return isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
}

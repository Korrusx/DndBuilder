// Типизированные ключи: опечатку в t('…') находит проверка типов. Словарь-образец — русский.
import 'i18next';

import type ru from '../locales/ru.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof ru };
  }
}

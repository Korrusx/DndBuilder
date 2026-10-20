

import { currentLanguage } from '@/shared/i18n';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(currentLanguage() === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

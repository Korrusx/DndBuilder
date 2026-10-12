

import { currentLanguage } from '@/shared/i18n/model';

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(currentLanguage() === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

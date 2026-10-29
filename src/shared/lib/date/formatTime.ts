import { currentLanguage } from '@/shared/i18n';

const locale = () => (currentLanguage() === 'en' ? 'en-GB' : 'ru-RU');

/** «19:05». */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
}

/** «29 октября» — без года. */
export function formatDayMonth(iso: string): string {
  return new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'long' });
}

/** Тот же календарный день (по местному времени). */
export function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

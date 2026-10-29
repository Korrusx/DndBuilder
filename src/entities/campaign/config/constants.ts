import type { ChronicleEventType, EntryTag } from '../model/types';

/** Метки заметок в порядке показа. */
export const ENTRY_TAGS: EntryTag[] = ['clue', 'loot', 'combat', 'quote', 'mystery'];

/** Однотипные события подряд в пределах этого промежутка склеиваются в одну строку летописи. */
export const COALESCE_WINDOW_MS = 2 * 60 * 1000;

/** События, которые склеиваются (натуральные 20 и 1, уровни, 0 хитов — никогда). */
export const COALESCED_EVENTS: ReadonlySet<ChronicleEventType> = new Set(['loot']);

/** Сколько заметок попадает в «Что произошло» сводки. */
export const RECAP_MAX_NOTES = 5;
/** Метки заметок, которые важнее остальных для сводки. */
export const RECAP_PRIORITY_TAGS: EntryTag[] = ['clue', 'combat'];

/** Квест «не трогали», если с последнего касания прошло столько сессий. */
export const STALE_AFTER_SESSIONS = 2;

/** Сколько символов текста показывать вокруг упоминания. */
export const SNIPPET_RADIUS = 60;

/** Сессия без событий дольше этого — при открытии хроники предлагаем её завершить. */
export const STALE_SESSION_MS = 12 * 60 * 60 * 1000;

/** Файл хроники кампании (экспорт, резервная копия, внутри файла персонажа). */
export const CHRONICLE_FORMAT = 'geroy/chronicle';
/** Версия формата. Повышается, если файл перестанет читаться старым способом. */
export const CHRONICLE_VERSION = 1;
export const CHRONICLE_EXTENSION = '.geroy-chronicle.json';

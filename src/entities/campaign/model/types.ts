import type { Edition } from '@/shared/content';
import type { PlayEvent } from '@/shared/lib/play-events';

// Хроника кампании. Кампания хранится отдельно от персонажей, персонажи к ней прикрепляются.

export type Campaign = {
  id: string;
  name: string;
  /** Имя мастера. */
  gmName?: string;
  edition?: Edition;
  createdAt: string;
  updatedAt: string;
};

/** Персонаж в кампании: действующий, павший или ушедший на покой («Зал героев»). */
export type ParticipantStatus = 'active' | 'fallen' | 'retired';

export type CampaignCharacter = {
  campaignId: string;
  characterId: string;
  status: ParticipantStatus;
  joinedAt: string;
  leftAt?: string;
  /** Одна строка для «Зала героев». */
  epitaph?: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  campaignId: string;
  /** Номер по порядку в кампании, ставится сам. */
  number: number;
  startedAt: string;
  /** Нет — сессия идёт сейчас. */
  endedAt?: string;
  title?: string;
  /** «Где остановились». */
  whereWeStopped?: string;
  updatedAt: string;
};

export type EntryKind = 'note' | 'event';
export type EntryTag = 'clue' | 'loot' | 'combat' | 'quote' | 'mystery';

export type Entry = {
  id: string;
  campaignId: string;
  /** null — запись «между сессиями». */
  sessionId: string | null;
  kind: EntryKind;
  createdAt: string;
  /** Текст заметки; упоминания — токены `@[Имя](e:<id>)`. У автособытий пусто. */
  text: string;
  tags: EntryTag[];
  /** Тайная запись: не попадает в сводку и в «Поделиться». */
  secret: boolean;
  /** Вид автособытия (только у kind = 'event'). */
  eventType?: string;
  /** Подробности автособытия. */
  eventData?: Record<string, unknown>;
  /** Чей персонаж: у автособытий и у заметок, сделанных из режима игры. */
  characterId?: string;
  /** Фото, приложенные к заметке (id в таблице photos). */
  photoIds: string[];
  updatedAt: string;
};

export type EntityType = 'person' | 'place' | 'faction' | 'quest';
export type PersonStatus = 'alive' | 'dead' | 'unknown';
export type QuestStatus = 'active' | 'done' | 'failed';
/** Отношение к героям: −2 враг · −1 подозрителен · 0 нейтрален · +1 дружелюбен · +2 союзник. */
export type Attitude = -2 | -1 | 0 | 1 | 2;

/** Карточка хроники: человек, место, фракция или квест. */
export type Entity = {
  id: string;
  campaignId: string;
  type: EntityType;
  name: string;
  /** Короткая роль под именем: «трактирщик», «гильдия воров», «таверна». */
  role: string;
  description: string;
  /** У людей — PersonStatus, у квестов — QuestStatus, у мест и фракций нет. */
  status?: PersonStatus | QuestStatus;
  attitude: Attitude;
  /** Личная линия героя (только у квестов): показывается выше остальных. */
  personal: boolean;
  /** Где находится (для людей) — карточка места. */
  placeId?: string;
  portraitPhotoId?: string;
  /** Кто дал квест — карточка человека или фракции. */
  givenById?: string;
  /** Награда за квест. */
  reward?: string;
  createdAt: string;
  updatedAt: string;
};

export type QuestStep = {
  id: string;
  questId: string;
  text: string;
  done: boolean;
  order: number;
  updatedAt: string;
};

/** Счётчик квеста (например, долг): «180 из 500 зм». */
export type QuestCounter = {
  questId: string;
  current: number;
  target: number;
  /** 'gp' — золотые монеты, иначе своя единица («голов», «страниц»). */
  unit: string;
  /** Можно вносить монеты из кошелька персонажа. */
  linkedToWallet: boolean;
  updatedAt: string;
};

/** Связь двух карточек («хранит груз»). Задел для доски связей. */
export type EntityLink = {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  updatedAt: string;
};

/** Что нужно от персонажа, чтобы перенести старое поле «название кампании». */
export type LegacyCharacter = { id: string; campaign?: string; edition?: Edition; createdAt: string };

export type LegacyLinkPlan = { campaigns: Campaign[]; links: CampaignCharacter[] };

// --- Упоминания ---

/** Токен упоминания в тексте записи: `@[Борис](e:<id>)`. */
export type Mention = {
  start: number;
  end: number;
  entityId: string;
  /** Имя на момент записи (если карточку удалили). */ name: string;
};

export type Segment =
  { kind: 'text'; text: string } | { kind: 'mention'; entityId: string; name: string; missing: boolean };

/** Упоминание в тексте редактора: в поле ввода видно «@Борис», а id лежит рядом. */
export type MentionRange = { start: number; end: number; entityId: string };

/** Текст в редакторе: то, что видит игрок, и где в нём упоминания. */
export type MentionDoc = { text: string; mentions: MentionRange[] };

/** Набираемое упоминание: `@` стоит на позиции `start`, после него — `query`. */
export type MentionQuery = { start: number; query: string };

/** Запись с упоминанием карточки и кусочек текста вокруг него. */
export type MentionHit = { entry: Entry; snippet: string };

// --- Автособытия ---

/** Автособытие летописи: событие из режима игры или из самой хроники.
 * В базе: `type` → entries.event_type, остальное → entries.event_data. */
export type ChronicleEvent =
  | PlayEvent
  | { type: 'sessionStart'; hp?: { current: number; max: number } }
  | { type: 'quest'; questId: string; name: string; change: 'new' | 'done' | 'failed' | 'active' }
  | { type: 'person'; entityId: string; name: string }
  | { type: 'payment'; questId: string; name: string; amount: number; unit: string };

export type ChronicleEventType = ChronicleEvent['type'];

/** Строка летописи: заметка или автособытие (возможно, склеенное из нескольких записей). */
export type TimelineItem =
  | { kind: 'note'; entry: Entry }
  | { kind: 'event'; event: ChronicleEvent; entries: Entry[]; at: string; sessionId: string | null };

// --- Квесты ---

export type QuestProgress = {
  /** «2 из 3» или «180 из 500 зм». */
  label: string;
  /** Сколько осталось: «1 шаг остался», «320 зм». Пусто, если всё сделано или прогресса нет. */
  remaining: string;
  /** Доля для полосы, 0…1. */
  fraction: number;
};

export type StaleQuest = { quest: Entity; lastSessionNumber: number };

// --- «В прошлый раз…» ---

export type Recap = {
  session: Session;
  happened: string[];
  met: Entity[];
  found: string[];
  openQuests: { quest: Entity; progress: QuestProgress | null }[];
  whereWeStopped: string;
};

/** Всё, что нужно экранам хроники. */
export type CampaignData = {
  campaign: Campaign;
  participants: CampaignCharacter[];
  sessions: Session[];
  entries: Entry[];
  entities: Entity[];
};

/** Блок летописи: сессия или записи «между сессиями» после неё (session — та, после которой они идут). */
export type TimelineGroup =
  | { kind: 'session'; key: string; session: Session; items: TimelineItem[]; noteCount: number; entryCount: number }
  | {
      kind: 'between';
      key: string;
      after: Session | null;
      items: TimelineItem[];
      noteCount: number;
      entryCount: number;
    };

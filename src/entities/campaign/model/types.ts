import type { Edition } from '@/shared/content';

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

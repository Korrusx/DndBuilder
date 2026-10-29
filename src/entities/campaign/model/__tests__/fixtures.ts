// Кампания «Тени Солёной Гавани» (мастер Никита) для тестов хроники.

import { eventEntryFields } from '../events';
import { mentionToken } from '../mentions';
import type { ChronicleEvent, Entity, EntityType, Entry, EntryTag, Session } from '../types';

export const CAMPAIGN_ID = 'shadows';

export function entity(id: string, name: string, type: EntityType = 'person', extra: Partial<Entity> = {}): Entity {
  return {
    id,
    campaignId: CAMPAIGN_ID,
    type,
    name,
    role: '',
    description: '',
    attitude: 0,
    personal: false,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...extra,
  };
}

export function session(number: number, startedAt: string, extra: Partial<Session> = {}): Session {
  return { id: `s${number}`, campaignId: CAMPAIGN_ID, number, startedAt, updatedAt: startedAt, ...extra };
}

let counter = 0;

export function note(
  sessionId: string | null,
  createdAt: string,
  text: string,
  extra: { tags?: EntryTag[]; secret?: boolean } = {},
): Entry {
  return {
    id: `n${++counter}`,
    campaignId: CAMPAIGN_ID,
    sessionId,
    kind: 'note',
    createdAt,
    text,
    tags: extra.tags ?? [],
    secret: extra.secret ?? false,
    photoIds: [],
    updatedAt: createdAt,
  };
}

export function event(sessionId: string | null, createdAt: string, chronicleEvent: ChronicleEvent): Entry {
  return {
    id: `ev${++counter}`,
    campaignId: CAMPAIGN_ID,
    sessionId,
    createdAt,
    text: '',
    tags: [],
    secret: false,
    photoIds: [],
    characterId: 'irma',
    updatedAt: createdAt,
    ...eventEntryFields(chronicleEvent),
  };
}

/** Упоминание карточки в тексте: m(boris) → `@[Борис](e:boris)`. */
export const m = (target: Entity) => mentionToken(target);

export const byId = (list: Entity[]) => new Map(list.map((item) => [item.id, item]));

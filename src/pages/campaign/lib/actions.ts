// Действия экрана кампании: начать и завершить сессию, удалить и вернуть записи.

import type { SQLiteDatabase } from 'expo-sqlite';

import type { CampaignData, Entry, Session } from '@/entities/campaign';
import { activeSessionOf, nextSessionNumber } from '@/entities/campaign';
import { deleteEntries, deletePhotos, saveEntry, saveSession } from '@/entities/campaign/api';
import { computeSheet } from '@/entities/character';
import { recordEvent } from '@/features/chronicle-journal';
import { contentFor } from '@/shared/content';
import { newId } from '@/shared/lib/id';

import type { CharactersById } from '../model/types';

/** Новая сессия со следующим номером; первое событие — «Начало сессии · хиты 38/38» героя кампании. */
export async function startSession(db: SQLiteDatabase, data: CampaignData, characters: CharactersById) {
  if (activeSessionOf(data.sessions)) {
    return;
  }
  const now = new Date().toISOString();
  await saveSession(db, {
    id: newId(),
    campaignId: data.campaign.id,
    number: nextSessionNumber(data.sessions),
    startedAt: now,
    updatedAt: now,
  });
  const hero = data.participants
    .filter((participant) => participant.status === 'active')
    .map((participant) => characters.get(participant.characterId))
    .find((character) => character && character.status.kind === 'ready');
  let hp: { current: number; max: number } | undefined;
  if (hero) {
    try {
      hp = { current: hero.state.currentHp, max: computeSheet(hero, contentFor(hero.edition)).maxHp };
    } catch {
      hp = undefined;
    }
  }
  await recordEvent(db, hp ? { type: 'sessionStart', hp } : { type: 'sessionStart' }, {
    campaignId: data.campaign.id,
    characterId: hero?.id,
    at: now,
  });
}

export async function endSession(db: SQLiteDatabase, session: Session, whereWeStopped: string) {
  await saveSession(db, {
    ...session,
    endedAt: new Date().toISOString(),
    whereWeStopped: whereWeStopped.trim() || undefined,
  });
}

/** Удаляет записи; фото удаляются отдельно — только когда отменить уже нельзя. */
export const removeEntries = (db: SQLiteDatabase, entries: Entry[]) =>
  deleteEntries(
    db,
    entries.map((entry) => entry.id),
  );

export async function restoreEntries(db: SQLiteDatabase, entries: Entry[]) {
  for (const entry of entries) {
    await saveEntry(db, entry);
  }
}

export const forgetPhotos = (db: SQLiteDatabase, entries: Entry[]) =>
  deletePhotos(
    db,
    entries.flatMap((entry) => entry.photoIds),
  );

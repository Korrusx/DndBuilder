// Превращение строк таблиц хроники в объекты модели и обратно.

import type { Edition } from '@/shared/content';

import type {
  Attitude,
  Campaign,
  CampaignCharacter,
  Entity,
  EntityLink,
  EntityType,
  Entry,
  EntryKind,
  EntryTag,
  ParticipantStatus,
  PersonStatus,
  QuestCounter,
  QuestStatus,
  QuestStep,
  Session,
} from '../model/types';
import type {
  CampaignCharacterRow,
  CampaignRow,
  EntityLinkRow,
  EntityRow,
  EntryRow,
  QuestCounterRow,
  QuestStepRow,
  SessionRow,
} from './types';

/** null из базы → отсутствующее поле. */
const opt = <T>(value: T | null): T | undefined => (value === null ? undefined : value);

function parseJson<T>(text: string | null, fallback: T): T {
  if (!text) {
    return fallback;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export function rowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    name: row.name,
    gmName: opt(row.gm_name),
    edition: opt(row.edition) as Edition | undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function campaignToRow(campaign: Campaign): CampaignRow {
  return {
    id: campaign.id,
    name: campaign.name,
    gm_name: campaign.gmName ?? null,
    edition: campaign.edition ?? null,
    created_at: campaign.createdAt,
    updated_at: campaign.updatedAt,
  };
}

export function rowToParticipant(row: CampaignCharacterRow): CampaignCharacter {
  return {
    campaignId: row.campaign_id,
    characterId: row.character_id,
    status: row.status as ParticipantStatus,
    joinedAt: row.joined_at,
    leftAt: opt(row.left_at),
    epitaph: opt(row.epitaph),
    updatedAt: row.updated_at,
  };
}

export function participantToRow(participant: CampaignCharacter): CampaignCharacterRow {
  return {
    campaign_id: participant.campaignId,
    character_id: participant.characterId,
    status: participant.status,
    joined_at: participant.joinedAt,
    left_at: participant.leftAt ?? null,
    epitaph: participant.epitaph ?? null,
    updated_at: participant.updatedAt,
  };
}

export function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    number: row.number,
    startedAt: row.started_at,
    endedAt: opt(row.ended_at),
    title: opt(row.title),
    whereWeStopped: opt(row.where_we_stopped),
    updatedAt: row.updated_at,
  };
}

export function sessionToRow(session: Session): SessionRow {
  return {
    id: session.id,
    campaign_id: session.campaignId,
    number: session.number,
    started_at: session.startedAt,
    ended_at: session.endedAt ?? null,
    title: session.title ?? null,
    where_we_stopped: session.whereWeStopped ?? null,
    updated_at: session.updatedAt,
  };
}

export function rowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    sessionId: row.session_id,
    kind: row.kind as EntryKind,
    createdAt: row.created_at,
    text: row.text,
    tags: parseJson<EntryTag[]>(row.tags, []),
    secret: row.secret === 1,
    eventType: opt(row.event_type),
    eventData: row.event_data === null ? undefined : parseJson<Record<string, unknown>>(row.event_data, {}),
    characterId: opt(row.character_id),
    photoIds: parseJson<string[]>(row.photo_ids, []),
    updatedAt: row.updated_at,
  };
}

export function entryToRow(entry: Entry): EntryRow {
  return {
    id: entry.id,
    campaign_id: entry.campaignId,
    session_id: entry.sessionId,
    kind: entry.kind,
    created_at: entry.createdAt,
    text: entry.text,
    tags: JSON.stringify(entry.tags),
    secret: entry.secret ? 1 : 0,
    event_type: entry.eventType ?? null,
    event_data: entry.eventData === undefined ? null : JSON.stringify(entry.eventData),
    character_id: entry.characterId ?? null,
    photo_ids: JSON.stringify(entry.photoIds),
    updated_at: entry.updatedAt,
  };
}

export function rowToEntity(row: EntityRow): Entity {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    type: row.type as EntityType,
    name: row.name,
    role: row.role,
    description: row.description,
    status: opt(row.status) as PersonStatus | QuestStatus | undefined,
    attitude: Math.max(-2, Math.min(2, row.attitude)) as Attitude,
    personal: row.personal === 1,
    placeId: opt(row.place_id),
    portraitPhotoId: opt(row.portrait_photo_id),
    givenById: opt(row.given_by_id),
    reward: opt(row.reward),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function entityToRow(entity: Entity): EntityRow {
  return {
    id: entity.id,
    campaign_id: entity.campaignId,
    type: entity.type,
    name: entity.name,
    role: entity.role,
    description: entity.description,
    status: entity.status ?? null,
    attitude: entity.attitude,
    personal: entity.personal ? 1 : 0,
    place_id: entity.placeId ?? null,
    portrait_photo_id: entity.portraitPhotoId ?? null,
    given_by_id: entity.givenById ?? null,
    reward: entity.reward ?? null,
    created_at: entity.createdAt,
    updated_at: entity.updatedAt,
  };
}

export function rowToQuestStep(row: QuestStepRow): QuestStep {
  return {
    id: row.id,
    questId: row.quest_id,
    text: row.text,
    done: row.done === 1,
    order: row.sort_order,
    updatedAt: row.updated_at,
  };
}

export function questStepToRow(step: QuestStep): QuestStepRow {
  return {
    id: step.id,
    quest_id: step.questId,
    text: step.text,
    done: step.done ? 1 : 0,
    sort_order: step.order,
    updated_at: step.updatedAt,
  };
}

export function rowToQuestCounter(row: QuestCounterRow): QuestCounter {
  return {
    questId: row.quest_id,
    current: row.current,
    target: row.target,
    unit: row.unit,
    linkedToWallet: row.linked_to_wallet === 1,
    updatedAt: row.updated_at,
  };
}

export function questCounterToRow(counter: QuestCounter): QuestCounterRow {
  return {
    quest_id: counter.questId,
    current: counter.current,
    target: counter.target,
    unit: counter.unit,
    linked_to_wallet: counter.linkedToWallet ? 1 : 0,
    updated_at: counter.updatedAt,
  };
}

export function rowToEntityLink(row: EntityLinkRow): EntityLink {
  return { id: row.id, fromId: row.from_id, toId: row.to_id, label: row.label, updatedAt: row.updated_at };
}

export function entityLinkToRow(link: EntityLink): EntityLinkRow {
  return { id: link.id, from_id: link.fromId, to_id: link.toId, label: link.label, updated_at: link.updatedAt };
}

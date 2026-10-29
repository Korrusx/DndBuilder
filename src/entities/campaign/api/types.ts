// Строки таблиц хроники в пользовательской базе (миграция 5).

export type CampaignRow = {
  id: string;
  name: string;
  gm_name: string | null;
  edition: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignCharacterRow = {
  campaign_id: string;
  character_id: string;
  status: string;
  joined_at: string;
  left_at: string | null;
  epitaph: string | null;
  updated_at: string;
};

export type SessionRow = {
  id: string;
  campaign_id: string;
  number: number;
  started_at: string;
  ended_at: string | null;
  title: string | null;
  where_we_stopped: string | null;
  updated_at: string;
};

export type EntryRow = {
  id: string;
  campaign_id: string;
  session_id: string | null;
  kind: string;
  created_at: string;
  text: string;
  tags: string;
  secret: number;
  event_type: string | null;
  event_data: string | null;
  character_id: string | null;
  photo_ids: string;
  updated_at: string;
};

export type EntityRow = {
  id: string;
  campaign_id: string;
  type: string;
  name: string;
  role: string;
  description: string;
  status: string | null;
  attitude: number;
  personal: number;
  place_id: string | null;
  portrait_photo_id: string | null;
  given_by_id: string | null;
  reward: string | null;
  created_at: string;
  updated_at: string;
};

export type QuestStepRow = {
  id: string;
  quest_id: string;
  text: string;
  done: number;
  sort_order: number;
  updated_at: string;
};

export type QuestCounterRow = {
  quest_id: string;
  current: number;
  target: number;
  unit: string;
  linked_to_wallet: number;
  updated_at: string;
};

export type EntityLinkRow = {
  id: string;
  from_id: string;
  to_id: string;
  label: string;
  updated_at: string;
};

/** Персонаж из таблицы characters — только то, что нужно для переноса названия кампании. */
export type LegacyCharacterRow = { id: string; data: string; created_at: string };

// Публичный API хроники кампании: типы и чистые функции. Работа с базой — '@/entities/campaign/api'.

export { COALESCE_WINDOW_MS, ENTRY_TAGS } from './config/constants';
export { amountText, coalesceEvents, entryEvent, eventEntryFields, eventText } from './model/events';
export { campaignNameKey, planLegacyLinks } from './model/legacy';
export {
  applyTextChange,
  findMentionQuery,
  firstSeenSession,
  fromMentionDoc,
  insertMention,
  mentionsOf,
  mentionToken,
  parseMentions,
  plainText,
  renderSegments,
  toMentionDoc,
} from './model/mentions';
export { contributeToCounter, questProgress, staleQuests } from './model/quests';
export { buildRecap } from './model/recap';
export { foldText, searchEntities } from './model/search';
export {
  activeSessionOf,
  firstLine,
  hallOfHeroes,
  isForgottenSession,
  nextSessionNumber,
  searchEntries,
  timelineGroups,
} from './model/timeline';
export type {
  Attitude,
  Campaign,
  CampaignCharacter,
  CampaignData,
  ChronicleEvent,
  ChronicleEventType,
  Entity,
  EntityLink,
  EntityType,
  Entry,
  EntryKind,
  EntryTag,
  LegacyCharacter,
  Mention,
  MentionDoc,
  MentionHit,
  MentionQuery,
  MentionRange,
  ParticipantStatus,
  PersonStatus,
  QuestCounter,
  QuestProgress,
  QuestStatus,
  QuestStep,
  Recap,
  Segment,
  Session,
  StaleQuest,
  TimelineGroup,
  TimelineItem,
} from './model/types';

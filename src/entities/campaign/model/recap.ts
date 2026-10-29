// «В прошлый раз…»: сводка сессии из записей игрока и автособытий. Ничего не придумывает — только подборка.

import { RECAP_MAX_NOTES, RECAP_PRIORITY_TAGS } from '../config/constants';
import { coalesceEvents, eventText } from './events';
import { firstSeenSession, parseMentions, plainText } from './mentions';
import { questProgress } from './quests';
import type { Entity, Entry, QuestCounter, QuestStep, Recap, Session } from './types';

/** Заметка может попасть в сводку: не тайная и без метки «тайна». */
const isPublicNote = (entry: Entry) => entry.kind === 'note' && !entry.secret && !entry.tags.includes('mystery');

const byTime = (a: Entry, b: Entry) => a.createdAt.localeCompare(b.createdAt);

/** Не больше `RECAP_MAX_NOTES` заметок: сначала с метками «подсказка» и «бой», затем последние; по порядку времени. */
function pickNotes(notes: Entry[]): Entry[] {
  if (notes.length <= RECAP_MAX_NOTES) {
    return notes;
  }
  const priority = notes.filter((note) => note.tags.some((tag) => RECAP_PRIORITY_TAGS.includes(tag)));
  const rest = notes.filter((note) => !priority.includes(note)).reverse();
  const picked = [...priority.slice(-RECAP_MAX_NOTES), ...rest].slice(0, RECAP_MAX_NOTES);
  return notes.filter((note) => picked.includes(note));
}

export function buildRecap(
  session: Session,
  entries: Entry[],
  sessions: Session[],
  entities: Entity[],
  steps: QuestStep[] = [],
  counters: QuestCounter[] = [],
): Recap {
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));
  const sessionEntries = entries.filter((entry) => entry.sessionId === session.id).sort(byTime);
  const notes = sessionEntries.filter(isPublicNote);

  // «Где остановились»: из поля сессии, а если его нет — последняя заметка (тогда её нет в «Что произошло»).
  const stopped = session.whereWeStopped?.trim();
  const lastNote = notes[notes.length - 1];
  const whereWeStopped = stopped || (lastNote ? plainText(lastNote.text, entitiesById).trim() : '');
  const happenedNotes = stopped || !lastNote ? notes : notes.slice(0, -1);
  const happened = pickNotes(happenedNotes).map((note) => plainText(note.text, entitiesById).trim());

  // Кого встретили: люди из публичных заметок сессии — сначала впервые увиденные, затем остальные.
  const mentioned: string[] = [];
  for (const note of notes) {
    for (const mention of parseMentions(note.text)) {
      if (!mentioned.includes(mention.entityId)) {
        mentioned.push(mention.entityId);
      }
    }
  }
  const people = mentioned
    .map((id) => entitiesById.get(id))
    .filter((entity): entity is Entity => entity?.type === 'person');
  const publicEntries = entries.filter((entry) => entry.kind !== 'note' || isPublicNote(entry));
  const isNew = (person: Entity) => firstSeenSession(person.id, publicEntries, sessions)?.id === session.id;
  const met = [...people.filter(isNew), ...people.filter((person) => !isNew(person))];

  const found = coalesceEvents(sessionEntries)
    .filter((item) => item.kind === 'event' && item.event.type === 'loot' && item.event.direction === 'gain')
    .map((item) => (item.kind === 'event' ? eventText(item.event, entitiesById) : ''));

  const openQuests = entities
    .filter((entity) => entity.type === 'quest' && (entity.status ?? 'active') === 'active')
    .sort((a, b) => Number(b.personal) - Number(a.personal))
    .map((quest) => ({
      quest,
      progress: questProgress(
        steps.filter((step) => step.questId === quest.id).sort((a, b) => a.order - b.order),
        counters.find((counter) => counter.questId === quest.id),
      ),
    }));

  return { session, happened, met, found, openQuests, whereWeStopped };
}

import { memoryDb } from '@/shared/db/__tests__/nodeSqlite';

import { parseChronicle, remapCharacters } from '../../model/exchange';
import { mentionToken } from '../../model/mentions';
import { saveCampaign, saveParticipant } from '../campaigns';
import { saveEntity } from '../entities';
import { saveEntry } from '../entries';
import { campaignExists, exportChronicle, importChronicle } from '../exchange';
import { savePhoto } from '../photos';
import { saveEntityLink, saveQuestCounter, saveQuestStep } from '../quests';
import { saveSession } from '../sessions';
import { loadCampaign } from '../useCampaign';

const at = '2026-10-22T19:00:00.000Z';

async function shadows() {
  const db = await memoryDb();
  await saveCampaign(db, {
    id: 'shadows',
    name: 'Тени Солёной Гавани',
    gmName: 'Никита',
    createdAt: at,
    updatedAt: at,
  });
  await saveParticipant(db, {
    campaignId: 'shadows',
    characterId: 'irma',
    status: 'active',
    joinedAt: at,
    updatedAt: at,
  });
  await saveSession(db, {
    id: 's11',
    campaignId: 'shadows',
    number: 11,
    startedAt: at,
    endedAt: at,
    whereWeStopped: 'У двери',
    updatedAt: at,
  });
  const base = {
    campaignId: 'shadows',
    role: '',
    description: '',
    attitude: 0 as const,
    personal: false,
    createdAt: at,
    updatedAt: at,
  };
  const boris = await saveEntity(db, {
    ...base,
    id: 'boris',
    type: 'person',
    name: 'Борис',
    status: 'alive',
    attitude: -1,
  });
  await saveEntity(db, { ...base, id: 'guild', type: 'faction', name: '«Тихие руки»' });
  await saveEntity(db, { ...base, id: 'debt', type: 'quest', name: 'Долг', status: 'active', personal: true });
  const photoId = await savePhoto(db, 'BASE64PHOTO');
  await saveEntry(db, {
    id: 'n1',
    campaignId: 'shadows',
    sessionId: 's11',
    kind: 'note',
    createdAt: at,
    text: `${mentionToken(boris)} врёт`,
    tags: ['clue'],
    secret: true,
    characterId: 'irma',
    photoIds: [photoId],
    updatedAt: at,
  });
  await saveQuestStep(db, { id: 'st', questId: 'debt', text: 'Найти', done: true, order: 0, updatedAt: at });
  await saveQuestCounter(db, {
    questId: 'debt',
    current: 180,
    target: 500,
    unit: 'gp',
    linkedToWallet: true,
    updatedAt: at,
  });
  await saveEntityLink(db, { id: 'l', fromId: 'boris', toId: 'guild', label: 'хранит груз', updatedAt: at });
  return db;
}

const withoutTimes = (value: unknown) =>
  JSON.parse(JSON.stringify(value), (key, v) => (key === 'updatedAt' ? undefined : v));

describe('экспорт и импорт хроники', () => {
  test('возвращают те же записи, карточки, связи, квесты и фото', async () => {
    const db = await shadows();
    const file = (await exportChronicle(db, 'shadows'))!;
    expect(Object.values(file.photos)).toEqual(['BASE64PHOTO']);

    const other = await memoryDb();
    const { file: parsed, skipped } = parseChronicle(JSON.parse(JSON.stringify(file)));
    expect(skipped).toBe(0);
    await importChronicle(other, parsed);
    const original = (await loadCampaign(db, 'shadows'))!;
    const restored = (await loadCampaign(other, 'shadows'))!;
    expect(withoutTimes(restored)).toEqual(withoutTimes(original));
    const photo = await other.getFirstAsync<{ data: string }>('SELECT data FROM photos');
    expect(photo?.data).toBe('BASE64PHOTO');
  });

  test('повторный импорт заменяет кампанию, а не дублирует', async () => {
    const db = await shadows();
    const file = (await exportChronicle(db, 'shadows'))!;
    await importChronicle(db, { ...file, entries: [] });
    expect(await campaignExists(db, 'shadows')).toBe(true);
    expect((await loadCampaign(db, 'shadows'))!.entries).toEqual([]);
    expect((await loadCampaign(db, 'shadows'))!.entities).toHaveLength(3);
  });

  test('чужой файл, файл новее и испорченные записи', () => {
    expect(() => parseChronicle({ format: 'dnd-builder/characters' })).toThrow();
    expect(() => parseChronicle({ format: 'geroy/chronicle', version: 99, campaign: {} })).toThrow();
    const { file, skipped } = parseChronicle({
      format: 'geroy/chronicle',
      version: 1,
      campaign: { id: 'c', name: 'Кампания', createdAt: at },
      entries: [{ id: 'ok', kind: 'note', createdAt: at, text: 'Ок' }, { broken: true }],
      entities: [{ id: 'e', type: 'person', name: 'Борис', campaignId: 'чужая' }],
    });
    expect(skipped).toBe(1);
    expect(file.entries[0]).toMatchObject({ id: 'ok', campaignId: 'c', tags: [], photoIds: [], secret: false });
    expect(file.entities[0].campaignId).toBe('c');
  });

  test('id героев переназначаются на новые после импорта персонажей', async () => {
    const db = await shadows();
    const file = remapCharacters((await exportChronicle(db, 'shadows'))!, { irma: 'irma-2' });
    expect(file.participants[0].characterId).toBe('irma-2');
    expect(file.entries[0].characterId).toBe('irma-2');
  });
});

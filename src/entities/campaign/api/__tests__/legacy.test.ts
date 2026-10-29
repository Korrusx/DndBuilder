import { memoryDb } from '@/shared/db/__tests__/nodeSqlite';

import { getCampaign, listCampaigns, listParticipants, participationOf, saveParticipant } from '../campaigns';
import { linkLegacyCampaigns } from '../legacy';

async function addCharacter(db: Awaited<ReturnType<typeof memoryDb>>, id: string, data: object, createdAt: string) {
  await db.runAsync(
    `INSERT INTO characters (id, name, status, draft_step, data, created_at, updated_at)
     VALUES (?, ?, 'ready', NULL, ?, ?, ?)`,
    id,
    id,
    JSON.stringify(data),
    createdAt,
    createdAt,
  );
}

describe('перенос кампаний в базе', () => {
  test('«Тени Солёной Гавани » и «тени солёной гавани» → одна кампания, оба персонажа активны', async () => {
    const db = await memoryDb();
    await addCharacter(db, 'irma', { campaign: 'Тени Солёной Гавани ', edition: '2024' }, '2026-01-01');
    await addCharacter(db, 'tom', { campaign: 'тени солёной гавани' }, '2026-02-01');
    await addCharacter(db, 'lone', { name: 'Без кампании' }, '2026-03-01');

    await linkLegacyCampaigns(db, '2026-10-29T12:00:00.000Z');

    const campaigns = await listCampaigns(db);
    expect(campaigns.map((campaign) => campaign.name)).toEqual(['Тени Солёной Гавани']);
    expect(campaigns[0].edition).toBe('2024');
    const participants = await listParticipants(db, campaigns[0].id);
    expect(participants.map((p) => [p.characterId, p.status])).toEqual([
      ['irma', 'active'],
      ['tom', 'active'],
    ]);
    expect(await participationOf(db, 'lone')).toBeNull();
    // Старое поле у персонажа остаётся.
    const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM characters WHERE id = ?', 'irma');
    expect(JSON.parse(row!.data).campaign).toBe('Тени Солёной Гавани ');
  });

  test('повторный запуск ничего не дублирует', async () => {
    const db = await memoryDb();
    await addCharacter(db, 'irma', { campaign: 'Тени Солёной Гавани' }, '2026-01-01');
    await linkLegacyCampaigns(db);
    await addCharacter(db, 'later', { campaign: 'Другая' }, '2026-05-01');
    await linkLegacyCampaigns(db);
    expect((await listCampaigns(db)).map((campaign) => campaign.name)).toEqual(['Тени Солёной Гавани']);
  });

  test('статус и эпитафия сохраняются («Зал героев»)', async () => {
    const db = await memoryDb();
    await addCharacter(db, 'irma', { campaign: 'Тени Солёной Гавани' }, '2026-01-01');
    await linkLegacyCampaigns(db);
    const participant = (await participationOf(db, 'irma'))!;
    await saveParticipant(db, { ...participant, status: 'fallen', epitaph: 'Ушла в тень', leftAt: '2026-10-01' });
    const fallen = (await participationOf(db, 'irma'))!;
    expect([fallen.status, fallen.epitaph, fallen.leftAt]).toEqual(['fallen', 'Ушла в тень', '2026-10-01']);
    expect((await getCampaign(db, fallen.campaignId))?.name).toBe('Тени Солёной Гавани');
  });
});

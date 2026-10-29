// Перенос старого поля «название кампании» у персонажа в отдельные кампании.

import type { Campaign, CampaignCharacter, LegacyCharacter, LegacyLinkPlan } from './types';

/** Ключ для сравнения названий: без пробелов по краям, без учёта регистра и разницы ё/е. */
export function campaignNameKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru').replace(/ё/g, 'е');
}

/**
 * Какие кампании создать и каких персонажей прикрепить. Персонажи с одинаковым (по `campaignNameKey`) названием
 * попадают в одну кампанию; если такая кампания уже есть — в неё. Уже прикреплённые персонажи пропускаются.
 */
export function planLegacyLinks(
  characters: LegacyCharacter[],
  existing: Campaign[],
  linkedCharacterIds: ReadonlySet<string>,
  now: string,
  makeId: () => string,
): LegacyLinkPlan {
  const byKey = new Map(existing.map((campaign) => [campaignNameKey(campaign.name), campaign]));
  const campaigns: Campaign[] = [];
  const links: CampaignCharacter[] = [];
  for (const character of characters) {
    const name = character.campaign?.trim().replace(/\s+/g, ' ');
    if (!name || linkedCharacterIds.has(character.id)) {
      continue;
    }
    const key = campaignNameKey(name);
    let campaign = byKey.get(key);
    if (!campaign) {
      campaign = { id: makeId(), name, edition: character.edition, createdAt: now, updatedAt: now };
      byKey.set(key, campaign);
      campaigns.push(campaign);
    }
    links.push({
      campaignId: campaign.id,
      characterId: character.id,
      status: 'active',
      joinedAt: character.createdAt,
      updatedAt: now,
    });
  }
  return { campaigns, links };
}

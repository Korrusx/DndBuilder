import { campaignNameKey, planLegacyLinks } from '../legacy';
import type { Campaign } from '../types';

const now = '2026-10-29T12:00:00.000Z';
const ids = () => {
  let n = 0;
  return () => `c${++n}`;
};

describe('перенос названия кампании', () => {
  test('сравнение без учёта регистра, пробелов по краям и ё/е', () => {
    expect(campaignNameKey('  Тени Солёной Гавани ')).toBe(campaignNameKey('тени соленой гавани'));
  });

  test('два персонажа с разным написанием → одна кампания, оба прикреплены', () => {
    const plan = planLegacyLinks(
      [
        { id: 'irma', campaign: 'Тени Солёной Гавани ', edition: '2024', createdAt: '2026-01-01' },
        { id: 'tom', campaign: 'тени солёной гавани', createdAt: '2026-02-01' },
        { id: 'solo', campaign: '   ', createdAt: '2026-03-01' },
        { id: 'none', createdAt: '2026-03-01' },
      ],
      [],
      new Set(),
      now,
      ids(),
    );
    expect(plan.campaigns).toEqual([
      { id: 'c1', name: 'Тени Солёной Гавани', edition: '2024', createdAt: now, updatedAt: now },
    ]);
    expect(plan.links.map((link) => [link.characterId, link.campaignId, link.status])).toEqual([
      ['irma', 'c1', 'active'],
      ['tom', 'c1', 'active'],
    ]);
    expect(plan.links[0].joinedAt).toBe('2026-01-01');
  });

  test('существующая кампания с тем же названием используется, прикреплённые пропускаются', () => {
    const existing: Campaign = { id: 'old', name: 'Тени Солёной Гавани', createdAt: now, updatedAt: now };
    const plan = planLegacyLinks(
      [
        { id: 'irma', campaign: 'ТЕНИ СОЛЁНОЙ ГАВАНИ', createdAt: '2026-01-01' },
        { id: 'tom', campaign: 'Тени Солёной Гавани', createdAt: '2026-01-01' },
      ],
      [existing],
      new Set(['tom']),
      now,
      ids(),
    );
    expect(plan.campaigns).toEqual([]);
    expect(plan.links.map((link) => [link.characterId, link.campaignId])).toEqual([['irma', 'old']]);
  });
});

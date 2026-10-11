import type { Coin } from '@/shared/content/types';

/** Сколько кружков ячеек рисует бланк на каждом круге (максимум по правилам). */
export const SLOT_FORM = [4, 3, 3, 3, 3, 2, 2, 1, 1];

export const COINS: { id: Coin; label: string }[] = [
  { id: 'cp', label: 'ММ' },
  { id: 'sp', label: 'СМ' },
  { id: 'ep', label: 'ЭМ' },
  { id: 'gp', label: 'ЗМ' },
  { id: 'pp', label: 'ПМ' },
];

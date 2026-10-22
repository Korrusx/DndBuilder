import type { SlotId } from '@/entities/character';

export type SlotDef = {
  id: SlotId;
  col: 0 | 1;
  row: number;
  pt: [number, number];
  labelRu: string;
  labelEn: string;
};

export type WeaponSlotDef = { id: SlotId; labelRu: string; labelEn: string };

export const BODY_SLOTS: SlotDef[] = [
  { id: 'head', col: 0, row: 0, pt: [172, 90], labelRu: 'Голова', labelEn: 'Head' },
  { id: 'shoulders', col: 0, row: 1, pt: [160, 140], labelRu: 'Плечи', labelEn: 'Shoulders' },
  { id: 'body', col: 0, row: 2, pt: [180, 190], labelRu: 'Тело', labelEn: 'Body' },
  { id: 'hands', col: 0, row: 3, pt: [134, 266], labelRu: 'Руки', labelEn: 'Hands' },
  { id: 'feet', col: 0, row: 4, pt: [168, 372], labelRu: 'Ноги', labelEn: 'Feet' },
  { id: 'neck', col: 1, row: 0, pt: [198, 118], labelRu: 'Шея', labelEn: 'Neck' },
  { id: 'wrists', col: 1, row: 1, pt: [252, 226], labelRu: 'Запястья', labelEn: 'Wrists' },
  { id: 'belt', col: 1, row: 2, pt: [212, 236], labelRu: 'Пояс', labelEn: 'Belt' },
  { id: 'ring1', col: 1, row: 3, pt: [257, 266], labelRu: 'Кольцо', labelEn: 'Ring' },
  { id: 'ring2', col: 1, row: 4, pt: [257, 272], labelRu: 'Кольцо', labelEn: 'Ring' },
];

export const WEAPON_SLOTS: WeaponSlotDef[] = [
  { id: 'main', labelRu: 'Основная рука', labelEn: 'Main Hand' },
  { id: 'off', labelRu: 'Вторая рука', labelEn: 'Off Hand' },
  { id: 'ranged', labelRu: 'Дальний бой', labelEn: 'Ranged' },
];

export const ALL_SLOT_DEFS: (SlotDef | WeaponSlotDef)[] = [...BODY_SLOTS, ...WEAPON_SLOTS];
export const ALL_SLOT_IDS = ALL_SLOT_DEFS.map((d) => d.id);

export const ARMOR_I18N_KEY: Record<string, string> = {
  shield: 'inventory.acShield',
  light: 'inventory.acLight',
  medium: 'inventory.acMedium',
};

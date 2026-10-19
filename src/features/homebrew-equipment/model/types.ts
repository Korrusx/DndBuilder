import type { Coin } from '@/shared/content';

export type HombrewEquipment = {
  id: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  weight: number | null;
  costAmount: number;
  costUnit: Coin;
  createdAt: string;
};

export type HombrewEquipmentRow = {
  id: string;
  name_ru: string;
  name_en: string;
  description_ru: string;
  weight: number | null;
  cost_amount: number;
  cost_unit: string;
  created_at: string;
};

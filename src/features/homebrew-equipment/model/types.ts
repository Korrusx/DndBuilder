import type { Coin } from '@/shared/content';

export type HombrewItemKind = 'gear' | 'weapon' | 'armor';
export type HombrewWeaponRangeType = 'melee' | 'ranged';
export type HombrewWeaponCategory = 'simple' | 'martial';
export type HombrewArmorCategory = 'light' | 'medium' | 'heavy' | 'shield';

export type HombrewEquipment = {
  id: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  weight: number | null;
  costAmount: number;
  costUnit: Coin;
  createdAt: string;
  kind: HombrewItemKind;
  // weapon
  weaponDamageDice: string;
  weaponDamageType: string;
  weaponRangeType: HombrewWeaponRangeType;
  weaponCategory: HombrewWeaponCategory;
  weaponIsLight: boolean;
  weaponIsTwoHanded: boolean;
  weaponIsFinesse: boolean;
  weaponIsThrown: boolean;
  /** Дополнительный урон (например, 1к6 огнём). Пустая строка — нет доп. урона. */
  additionalDamageDice: string;
  additionalDamageType: string;
  // armor
  armorCategory: HombrewArmorCategory;
  armorBase: number;
  armorStealthDisadvantage: boolean;
  /** Магический бонус к атаке/урону (оружие) или к КЗ (броня/щит). 0 = не магический. */
  magicBonus: number;
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
  kind: string;
  weapon_damage_dice: string;
  weapon_damage_type: string;
  weapon_range_type: string;
  weapon_category: string;
  weapon_is_light: number;
  weapon_is_two_handed: number;
  weapon_is_finesse: number;
  weapon_is_thrown: number;
  add_damage_dice: string;
  add_damage_type: string;
  armor_category: string;
  armor_base: number;
  armor_stealth: number;
  magic_bonus: number;
};

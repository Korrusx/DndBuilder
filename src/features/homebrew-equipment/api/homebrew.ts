import type { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import type { ArmorInfo, Coin, Equipment, WeaponInfo } from '@/shared/content';
import { HOMEBREW_EQUIPMENT_PREFIX } from '@/shared/content';

import type { HombrewEquipment, HombrewEquipmentRow } from '../model/types';

export function newHombrewId(): string {
  return `${HOMEBREW_EQUIPMENT_PREFIX}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function rowToHombrew(r: HombrewEquipmentRow): HombrewEquipment {
  return {
    id: r.id,
    nameRu: r.name_ru,
    nameEn: r.name_en,
    descriptionRu: r.description_ru,
    weight: r.weight,
    costAmount: r.cost_amount,
    costUnit: r.cost_unit as Coin,
    createdAt: r.created_at,
    kind: (r.kind as HombrewEquipment['kind']) || 'gear',
    weaponDamageDice: r.weapon_damage_dice || '1к6',
    weaponDamageType: r.weapon_damage_type || 'рубящий',
    weaponRangeType: (r.weapon_range_type as HombrewEquipment['weaponRangeType']) || 'melee',
    weaponCategory: (r.weapon_category as HombrewEquipment['weaponCategory']) || 'simple',
    weaponIsLight: !!r.weapon_is_light,
    weaponIsTwoHanded: !!r.weapon_is_two_handed,
    weaponIsFinesse: !!r.weapon_is_finesse,
    weaponIsThrown: !!r.weapon_is_thrown,
    additionalDamageDice: r.add_damage_dice || '',
    additionalDamageType: r.add_damage_type || '',
    armorCategory: (r.armor_category as HombrewEquipment['armorCategory']) || 'light',
    armorBase: r.armor_base || 11,
    armorStealthDisadvantage: !!r.armor_stealth,
    magicBonus: r.magic_bonus ?? 0,
  };
}

function buildWeaponInfo(h: HombrewEquipment): WeaponInfo {
  const props: string[] = [];
  if (h.weaponIsLight) props.push('light');
  if (h.weaponIsTwoHanded) props.push('two-handed');
  if (h.weaponIsFinesse) props.push('finesse');
  if (h.weaponIsThrown) props.push('thrown');
  if (h.weaponRangeType === 'ranged') props.push('ammunition');
  return {
    category: h.weaponCategory,
    range: h.weaponRangeType,
    damage: { dice: h.weaponDamageDice || '1к6', type: h.weaponDamageType || 'bludgeoning' },
    reach: h.weaponRangeType === 'melee' ? { normal: 5 } : { normal: 80, long: 320 },
    properties: props,
  };
}

function buildArmorInfo(h: HombrewEquipment): ArmorInfo {
  const cat = h.armorCategory;
  return {
    category: cat,
    base: h.armorBase,
    dexBonus: cat !== 'heavy',
    maxDex: cat === 'medium' ? 2 : undefined,
    strMinimum: 0,
    stealthDisadvantage: h.armorStealthDisadvantage,
  };
}

function weaponProfCategory(h: HombrewEquipment): string {
  return h.weaponCategory === 'simple' ? 'simple-weapons' : 'martial-weapons';
}

function armorProfCategory(h: HombrewEquipment): string {
  const map: Record<HombrewEquipment['armorCategory'], string> = {
    light: 'light-armor',
    medium: 'medium-armor',
    heavy: 'heavy-armor',
    shield: 'shields',
  };
  return map[h.armorCategory];
}

export function hombrewToEquipment(h: HombrewEquipment): Equipment {
  const base: Equipment = {
    id: h.id,
    name: { ru: h.nameRu, en: h.nameEn || h.nameRu },
    categories: ['adventuring-gear'],
    cost: { amount: h.costAmount, unit: h.costUnit },
    weight: h.weight ?? undefined,
    description: h.descriptionRu ? { ru: h.descriptionRu, en: h.descriptionRu } : undefined,
    ...(h.magicBonus > 0 ? { magicBonus: h.magicBonus } : {}),
  };
  if (h.kind === 'weapon') {
    const additionalDamage = h.additionalDamageDice
      ? [{ dice: h.additionalDamageDice, type: h.additionalDamageType || h.additionalDamageDice }]
      : undefined;
    return {
      ...base,
      categories: [weaponProfCategory(h)],
      weapon: buildWeaponInfo(h),
      ...(additionalDamage ? { additionalDamage } : {}),
    };
  }
  if (h.kind === 'armor') {
    return { ...base, categories: [armorProfCategory(h)], armor: buildArmorInfo(h) };
  }
  return base;
}

export async function loadHombrewEquipment(db: SQLiteDatabase): Promise<HombrewEquipment[]> {
  const rows = await db.getAllAsync<HombrewEquipmentRow>(
    'SELECT * FROM homebrew_equipment ORDER BY created_at DESC',
  );
  return rows.map(rowToHombrew);
}

export async function saveHombrewEquipment(db: SQLiteDatabase, item: HombrewEquipment): Promise<void> {
  await db.runAsync(
    `INSERT INTO homebrew_equipment
       (id, name_ru, name_en, description_ru, weight, cost_amount, cost_unit, created_at,
        kind, weapon_damage_dice, weapon_damage_type, weapon_range_type, weapon_category,
        weapon_is_light, weapon_is_two_handed, weapon_is_finesse, weapon_is_thrown,
        add_damage_dice, add_damage_type,
        armor_category, armor_base, armor_stealth,
        magic_bonus)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       name_ru=excluded.name_ru, name_en=excluded.name_en,
       description_ru=excluded.description_ru, weight=excluded.weight,
       cost_amount=excluded.cost_amount, cost_unit=excluded.cost_unit,
       kind=excluded.kind,
       weapon_damage_dice=excluded.weapon_damage_dice,
       weapon_damage_type=excluded.weapon_damage_type,
       weapon_range_type=excluded.weapon_range_type,
       weapon_category=excluded.weapon_category,
       weapon_is_light=excluded.weapon_is_light,
       weapon_is_two_handed=excluded.weapon_is_two_handed,
       weapon_is_finesse=excluded.weapon_is_finesse,
       weapon_is_thrown=excluded.weapon_is_thrown,
       add_damage_dice=excluded.add_damage_dice,
       add_damage_type=excluded.add_damage_type,
       armor_category=excluded.armor_category,
       armor_base=excluded.armor_base,
       armor_stealth=excluded.armor_stealth,
       magic_bonus=excluded.magic_bonus`,
    item.id, item.nameRu, item.nameEn, item.descriptionRu,
    item.weight, item.costAmount, item.costUnit, item.createdAt,
    item.kind,
    item.weaponDamageDice, item.weaponDamageType, item.weaponRangeType, item.weaponCategory,
    item.weaponIsLight ? 1 : 0, item.weaponIsTwoHanded ? 1 : 0,
    item.weaponIsFinesse ? 1 : 0, item.weaponIsThrown ? 1 : 0,
    item.additionalDamageDice, item.additionalDamageType,
    item.armorCategory, item.armorBase, item.armorStealthDisadvantage ? 1 : 0,
    item.magicBonus,
  );
}

export async function deleteHombrewEquipment(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM homebrew_equipment WHERE id = ?', id);
}

export function useHombrewEquipment() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<HombrewEquipment[]>([]);

  const reload = useCallback(async () => {
    setItems(await loadHombrewEquipment(db));
  }, [db]);

  useEffect(() => { reload(); }, [reload]);

  const save = useCallback(async (item: HombrewEquipment) => {
    await saveHombrewEquipment(db, item);
    await reload();
  }, [db, reload]);

  const remove = useCallback(async (id: string) => {
    await deleteHombrewEquipment(db, id);
    await reload();
  }, [db, reload]);

  return { items, save, remove, reload };
}

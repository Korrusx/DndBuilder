import type { SQLiteDatabase } from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import type { Coin, Equipment } from '@/shared/content';
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
  };
}

export function hombrewToEquipment(h: HombrewEquipment): Equipment {
  return {
    id: h.id,
    name: { ru: h.nameRu, en: h.nameEn || h.nameRu },
    categories: ['adventuring-gear'],
    cost: { amount: h.costAmount, unit: h.costUnit },
    weight: h.weight ?? undefined,
    description: h.descriptionRu ? { ru: h.descriptionRu, en: h.descriptionRu } : undefined,
  };
}

export async function loadHombrewEquipment(db: SQLiteDatabase): Promise<HombrewEquipment[]> {
  const rows = await db.getAllAsync<HombrewEquipmentRow>(
    'SELECT * FROM homebrew_equipment ORDER BY created_at DESC',
  );
  return rows.map(rowToHombrew);
}

export async function saveHombrewEquipment(db: SQLiteDatabase, item: HombrewEquipment): Promise<void> {
  await db.runAsync(
    `INSERT INTO homebrew_equipment (id, name_ru, name_en, description_ru, weight, cost_amount, cost_unit, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name_ru = excluded.name_ru,
       name_en = excluded.name_en,
       description_ru = excluded.description_ru,
       weight = excluded.weight,
       cost_amount = excluded.cost_amount,
       cost_unit = excluded.cost_unit`,
    item.id,
    item.nameRu,
    item.nameEn,
    item.descriptionRu,
    item.weight,
    item.costAmount,
    item.costUnit,
    item.createdAt,
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

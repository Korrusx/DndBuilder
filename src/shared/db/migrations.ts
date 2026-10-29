import type { Migration, MigrationDb } from './types';

// Миграции пользовательской базы. Версия схемы хранится в PRAGMA user_version.
// Новую миграцию добавляй в конец списка; уже выпущенные миграции не меняй.
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      // Персонаж целиком (только выборы игрока и состояние игры) лежит в `data` как JSON.
      // Отдельные колонки — только то, что нужно для списка и сортировки.
      await db.execAsync(`
        CREATE TABLE characters (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          status TEXT NOT NULL,
          draft_step INTEGER,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX characters_updated_at ON characters (updated_at);
        CREATE TABLE meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
    },
  },
  {
    version: 2,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE homebrew_equipment (
          id TEXT PRIMARY KEY NOT NULL,
          name_ru TEXT NOT NULL,
          name_en TEXT NOT NULL DEFAULT '',
          description_ru TEXT NOT NULL DEFAULT '',
          weight REAL,
          cost_amount INTEGER NOT NULL DEFAULT 0,
          cost_unit TEXT NOT NULL DEFAULT 'gp',
          created_at TEXT NOT NULL
        );
      `);
    },
  },
  {
    version: 3,
    up: async (db) => {
      await db.execAsync(`
        ALTER TABLE homebrew_equipment ADD COLUMN kind TEXT NOT NULL DEFAULT 'gear';
        ALTER TABLE homebrew_equipment ADD COLUMN weapon_damage_dice TEXT NOT NULL DEFAULT '';
        ALTER TABLE homebrew_equipment ADD COLUMN weapon_damage_type TEXT NOT NULL DEFAULT '';
        ALTER TABLE homebrew_equipment ADD COLUMN weapon_range_type TEXT NOT NULL DEFAULT 'melee';
        ALTER TABLE homebrew_equipment ADD COLUMN weapon_category TEXT NOT NULL DEFAULT 'simple';
        ALTER TABLE homebrew_equipment ADD COLUMN weapon_is_light INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE homebrew_equipment ADD COLUMN weapon_is_two_handed INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE homebrew_equipment ADD COLUMN weapon_is_finesse INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE homebrew_equipment ADD COLUMN weapon_is_thrown INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE homebrew_equipment ADD COLUMN armor_category TEXT NOT NULL DEFAULT 'light';
        ALTER TABLE homebrew_equipment ADD COLUMN armor_base INTEGER NOT NULL DEFAULT 11;
        ALTER TABLE homebrew_equipment ADD COLUMN armor_stealth INTEGER NOT NULL DEFAULT 0;
      `);
    },
  },
  {
    version: 4,
    up: async (db) => {
      await db.execAsync(`
        ALTER TABLE homebrew_equipment ADD COLUMN magic_bonus INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE homebrew_equipment ADD COLUMN add_damage_dice TEXT NOT NULL DEFAULT '';
        ALTER TABLE homebrew_equipment ADD COLUMN add_damage_type TEXT NOT NULL DEFAULT '';
      `);
    },
  },
  {
    version: 5,
    up: async (db) => {
      // Хроника кампании. Кампания живёт отдельно от персонажей, персонажи к ней прикрепляются.
      // У каждой строки есть updated_at — задел для будущей синхронизации.
      await db.execAsync(`
        CREATE TABLE campaigns (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          gm_name TEXT,
          edition TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE campaign_characters (
          campaign_id TEXT NOT NULL,
          character_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          joined_at TEXT NOT NULL,
          left_at TEXT,
          epitaph TEXT,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (campaign_id, character_id)
        );
        CREATE INDEX campaign_characters_character ON campaign_characters (character_id);
        CREATE TABLE sessions (
          id TEXT PRIMARY KEY NOT NULL,
          campaign_id TEXT NOT NULL,
          number INTEGER NOT NULL,
          started_at TEXT NOT NULL,
          ended_at TEXT,
          title TEXT,
          where_we_stopped TEXT,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX sessions_campaign ON sessions (campaign_id, number);
        CREATE TABLE entries (
          id TEXT PRIMARY KEY NOT NULL,
          campaign_id TEXT NOT NULL,
          session_id TEXT,
          kind TEXT NOT NULL,
          created_at TEXT NOT NULL,
          text TEXT NOT NULL DEFAULT '',
          tags TEXT NOT NULL DEFAULT '[]',
          secret INTEGER NOT NULL DEFAULT 0,
          event_type TEXT,
          event_data TEXT,
          character_id TEXT,
          photo_ids TEXT NOT NULL DEFAULT '[]',
          updated_at TEXT NOT NULL
        );
        CREATE INDEX entries_campaign ON entries (campaign_id, created_at);
        CREATE TABLE entities (
          id TEXT PRIMARY KEY NOT NULL,
          campaign_id TEXT NOT NULL,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          status TEXT,
          attitude INTEGER NOT NULL DEFAULT 0,
          personal INTEGER NOT NULL DEFAULT 0,
          place_id TEXT,
          portrait_photo_id TEXT,
          given_by_id TEXT,
          reward TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX entities_campaign ON entities (campaign_id, type);
        CREATE TABLE quest_steps (
          id TEXT PRIMARY KEY NOT NULL,
          quest_id TEXT NOT NULL,
          text TEXT NOT NULL,
          done INTEGER NOT NULL DEFAULT 0,
          sort_order INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX quest_steps_quest ON quest_steps (quest_id, sort_order);
        CREATE TABLE quest_counters (
          quest_id TEXT PRIMARY KEY NOT NULL,
          current INTEGER NOT NULL DEFAULT 0,
          target INTEGER NOT NULL,
          unit TEXT NOT NULL DEFAULT 'gp',
          linked_to_wallet INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        );
        CREATE TABLE entity_links (
          id TEXT PRIMARY KEY NOT NULL,
          from_id TEXT NOT NULL,
          to_id TEXT NOT NULL,
          label TEXT NOT NULL DEFAULT '',
          updated_at TEXT NOT NULL
        );
        CREATE INDEX entity_links_from ON entity_links (from_id);
        CREATE INDEX entity_links_to ON entity_links (to_id);
        CREATE TABLE photos (
          id TEXT PRIMARY KEY NOT NULL,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
    },
  },
];

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

/** Применяет все миграции новее текущей версии базы, каждую в своей транзакции. */
export async function migrate(db: MigrationDb, migrations: Migration[] = MIGRATIONS): Promise<number> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let current = row?.user_version ?? 0;
  for (const m of migrations) {
    if (m.version <= current) {
      continue;
    }
    await db.withTransactionAsync(async () => {
      await m.up(db);
      await db.execAsync(`PRAGMA user_version = ${m.version};`);
    });
    current = m.version;
  }
  return current;
}

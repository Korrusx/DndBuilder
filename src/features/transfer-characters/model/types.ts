import type { ChronicleFile } from '@/entities/campaign';
import type { Character } from '@/entities/character';

import { EXCHANGE_FORMAT } from '../config/constants';

export type ExchangeFile = {
  format: typeof EXCHANGE_FORMAT;
  version: number;
  exportedAt: string;
  /** Версия справочника, с которой сделан файл (для диагностики). */
  contentVersion: string;
  characters: Character[];
  /** Хроники кампаний (необязательно): героев указывают по id из этого файла. */
  chronicles?: ChronicleFile[];
};

export type ImportResult = {
  characters: Character[];
  /** Хроники из файла; id героев уже переназначены на новые. */
  chronicles: ChronicleFile[];
  /** Что пропущено или может отображаться не полностью. */
  warnings: string[];
};

import type { Character } from '@/entities/character/model/types';
import { EXCHANGE_FORMAT } from '../config/constants';

export type ExchangeFile = {
  format: typeof EXCHANGE_FORMAT;
  version: number;
  exportedAt: string;
  /** Версия справочника, с которой сделан файл (для диагностики). */
  contentVersion: string;
  characters: Character[];
};

export type ImportResult = {
  characters: Character[];
  /** Что пропущено или может отображаться не полностью. */
  warnings: string[];
};

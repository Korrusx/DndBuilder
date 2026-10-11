import type { SourcedId } from '../model/types';

/** Подписи источника умения: «Класс», «Подкласс», «Вид», «Черта». */
export const FEATURE_SOURCE_LABEL: Record<SourcedId['source'], string> = { class: 'Класс', subclass: 'Подкласс', species: 'Вид', feat: 'Черта' };

import type { LocalizedText } from '@/shared/content';

export type FeatSlotKind = 'asi' | 'epic-boon';

export type LevelUpPlan = {
  classId: string;
  /** Новый уровень класса. */
  toLevel: number;
  /** Новый общий уровень персонажа: им помечаются выборы уровня (черта, навыки). */
  charLevel: number;
  /** Класс взят впервые (мультикласс). */
  isNewClass: boolean;
  /** Владения на выбор от нового класса (навык плута, инструмент барда…). */
  multiclassChoices: { key: string; choose: number; desc?: LocalizedText; options: string[] }[];
  /** Умения нового уровня с выбором варианта («Божественный порядок»). */
  featureOptions: string[];
  /** Умения класса и подкласса, получаемые на новом уровне. */
  features: { id: string; source: 'class' | 'subclass' }[];
  needsSubclass: boolean;
  featSlot: FeatSlotKind | null;
  expertise: number;
  fightingStyles: number;
  skillChoices: { key: string; featureId: string; choose: number; options: string[] }[];
  languages: number;
};

/** `action: 'spells'` — у проблемы есть кнопка «Выбрать заклинания». */
export type LevelUpIssue = { message: string; blocking: boolean; action?: 'spells' };

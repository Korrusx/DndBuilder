
export type FeatSlotKind = 'asi' | 'epic-boon';

export type LevelUpPlan = {
  classId: string;
  toLevel: number;
  /** Умения класса и подкласса, получаемые на новом уровне. */
  features: { id: string; source: 'class' | 'subclass' }[];
  needsSubclass: boolean;
  featSlot: FeatSlotKind | null;
  expertise: number;
  fightingStyles: number;
  skillChoices: { key: string; featureId: string; choose: number; options: string[] }[];
  languages: number;
};

export type LevelUpIssue = { message: string; blocking: boolean };

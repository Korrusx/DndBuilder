import type { GameIconName } from '@/shared/ui';

/** Иконки карточек классов (game-icons.net). Классу без иконки — общий щит. */
export const CLASS_ICONS: Record<string, GameIconName> = {
  barbarian: 'battle-axe',
  bard: 'lyre',
  cleric: 'holy-symbol',
  druid: 'oak-leaf',
  fighter: 'crossed-swords',
  monk: 'meditation',
  paladin: 'templar-shield',
  ranger: 'bowman',
  rogue: 'cloak-dagger',
  sorcerer: 'fire-spell-cast',
  warlock: 'warlock-eye',
  wizard: 'wizard-staff',
};

export const DEFAULT_CLASS_ICON: GameIconName = 'shield';

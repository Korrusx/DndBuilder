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

/** Иконки карточек видов (game-icons.net). Виду без иконки — общий силуэт. */
export const SPECIES_ICONS: Record<string, GameIconName> = {
  human: 'philosopher-bust',
  elf: 'woman-elf-face',
  dwarf: 'dwarf-face',
  halfling: 'hobbit-dwelling',
  gnome: 'bad-gnome',
  goliath: 'giant',
  orc: 'orc-head',
  dragonborn: 'spiked-dragon-head',
  tiefling: 'devil-mask',
  aasimar: 'angel-outfit',
  dhampir: 'vampire-dracula',
  kalashtar: 'third-eye',
  warforged: 'metal-golem-head',
  khoravar: 'elf-ear',
  changeling: 'invisible-face',
  shifter: 'wolf-head',
};

export const DEFAULT_SPECIES_ICON: GameIconName = 'person';

/** Иконки плиток предысторий (game-icons.net), обе редакции. */
export const BACKGROUND_ICONS: Record<string, GameIconName> = {
  acolyte: 'prayer',
  criminal: 'lockpicks',
  sage: 'open-book',
  soldier: 'spartan-helmet',
  artisan: 'anvil',
  charlatan: 'carnival-mask',
  entertainer: 'juggler',
  farmer: 'wheat',
  guard: 'halberd',
  guide: 'compass',
  hermit: 'lantern',
  merchant: 'scales',
  noble: 'imperial-crown',
  sailor: 'anchor',
  scribe: 'quill-ink',
  wayfarer: 'walking-boot',
  'folk-hero': 'pitchfork',
  'guild-artisan': 'gear-hammer',
  outlander: 'campfire',
  urchin: 'rat',
};

export const DEFAULT_BACKGROUND_ICON: GameIconName = 'person';

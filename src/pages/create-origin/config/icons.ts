import type { GameIconName } from '@/shared/ui';

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

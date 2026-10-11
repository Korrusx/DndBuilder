import type { Character, CharacterSheet } from '@/entities/character';

export type HpBlockProps = { c: Character; sheet: CharacterSheet; onDeathSave: () => void };

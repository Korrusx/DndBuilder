import type { Character, CharacterSheet } from '@/entities/character';

export type HpBlockProps = { character: Character; sheet: CharacterSheet; onDeathSave: () => void };

import { contentFor } from '@/shared/content';

import { computeSheet } from '../model/sheet';
import type { Character, CharacterSheet } from '../model/types';

export function safeSheet(c: Character): CharacterSheet | null {
  try {
    return computeSheet(c, contentFor(c.edition));
  } catch {
    return null;
  }
}

import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { Attitude, EntityType, PersonStatus } from '@/entities/campaign';
import { colors } from '@/shared/config';

export const ATTITUDES: Attitude[] = [-2, -1, 0, 1, 2];

/** Цвет деления шкалы отношения, когда оно выбрано. */
export const ATTITUDE_COLORS: Record<Attitude, string> = {
  [-2]: colors.damage,
  [-1]: '#FFB089',
  0: colors.textTertiary,
  1: colors.info,
  2: colors.heal,
};

export const PERSON_STATUSES: PersonStatus[] = ['alive', 'dead', 'unknown'];

export const ENTITY_ICONS: Record<EntityType, ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  person: 'account-outline',
  place: 'map-marker-outline',
  faction: 'shield-outline',
  quest: 'script-text-outline',
};

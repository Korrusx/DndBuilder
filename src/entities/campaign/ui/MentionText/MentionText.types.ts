import type { StyleProp, TextStyle } from 'react-native';

import type { Entity } from '../../model/types';

export type MentionTextProps = {
  /** Текст записи с токенами упоминаний. */
  text: string;
  entitiesById: ReadonlyMap<string, Entity>;
  onMentionPress?: (entityId: string) => void;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

import { Text } from 'react-native';

import { renderSegments } from '../../model/mentions';
import { styles } from './MentionText.styles';
import type { MentionTextProps } from './MentionText.types';

/** Текст записи: упоминания — янтарные «@Борис» с текущим именем карточки, по нажатию открывают её. */
export function MentionText({ text, entitiesById, onMentionPress, style, numberOfLines }: MentionTextProps) {
  return (
    <Text style={[styles.text, style]} numberOfLines={numberOfLines}>
      {renderSegments(text, entitiesById).map((segment, i) =>
        segment.kind === 'text' ? (
          segment.text
        ) : (
          <Text
            key={i}
            style={[styles.mention, segment.missing && styles.missing]}
            onPress={onMentionPress && !segment.missing ? () => onMentionPress(segment.entityId) : undefined}
            suppressHighlighting
          >
            {` @${segment.name} `}
          </Text>
        ),
      )}
    </Text>
  );
}

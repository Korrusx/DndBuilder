import { Text, TextInput } from 'react-native';

import { applyTextChange } from '@/entities/campaign';
import { colors } from '@/shared/config';

import { styles } from './MentionInput.styles';
import type { MentionInputProps } from './MentionInput.types';

/** Поле записи: обычный текст и янтарные «@Борис». Упоминание, задетое правкой, становится обычным текстом. */
export function MentionInput({ doc, onChange, onCursor, forcedCursor, placeholder }: MentionInputProps) {
  const pieces: { text: string; mention: boolean }[] = [];
  let position = 0;
  for (const mention of doc.mentions) {
    if (mention.start > position) {
      pieces.push({ text: doc.text.slice(position, mention.start), mention: false });
    }
    pieces.push({ text: doc.text.slice(mention.start, mention.end), mention: true });
    position = mention.end;
  }
  if (position < doc.text.length) {
    pieces.push({ text: doc.text.slice(position), mention: false });
  }

  return (
    <TextInput
      autoFocus
      multiline
      scrollEnabled
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      onChangeText={(text) => onChange(applyTextChange(doc, text))}
      onSelectionChange={(event) => onCursor(event.nativeEvent.selection.end)}
      selection={forcedCursor === null ? undefined : { start: forcedCursor, end: forcedCursor }}
      style={styles.input}
    >
      {pieces.map((piece, i) => (
        <Text key={i} style={piece.mention ? styles.mention : undefined}>
          {piece.text}
        </Text>
      ))}
    </TextInput>
  );
}

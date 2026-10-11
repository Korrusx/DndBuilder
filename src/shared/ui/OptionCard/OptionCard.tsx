import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '../AppText/AppText';
import { styles } from './OptionCard.styles';

/** Карточка варианта (класс, предыстория, вид, набор снаряжения). */
export function OptionCard({
  title,
  lines,
  selected,
  onPress,
  compact,
}: {
  title: ReactNode;
  lines?: ReactNode[];
  selected?: boolean;
  /** Без обработчика — просто карточка с информацией. */
  onPress?: () => void;
  compact?: boolean;
}) {
  const body = (
    <>
      {typeof title === 'string' ? <AppText variant="heading">{title}</AppText> : title}
      {lines?.map((line, i) =>
        typeof line === 'string' ? (
          <AppText key={i} variant="secondary">
            {line}
          </AppText>
        ) : (
          <View key={i}>{line}</View>
        ),
      )}
    </>
  );
  if (!onPress) return <View style={[styles.card, compact && styles.cardCompact]}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        selected && styles.cardSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      {body}
    </Pressable>
  );
}

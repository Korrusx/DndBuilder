import { Pressable, View } from 'react-native';

import { colors } from '@/shared/config';


import { AppText } from '../AppText/AppText';
import { GameIcon } from '../GameIcon/GameIcon';
import { styles } from './OptionCard.styles';
import type { OptionCardProps } from './OptionCard.types';

/** Карточка варианта (класс, предыстория, вид, набор снаряжения). */
export function OptionCard({
  title,
  lines,
  selected,
  onPress,
  compact,
  icon,
}: OptionCardProps) {
  const heading = typeof title === 'string' ? <AppText variant="heading">{title}</AppText> : title;
  const body = (
    <>
      {icon ? (
        <View style={styles.title}>
          <GameIcon name={icon} size={26} color={selected ? colors.accent : colors.textSecondary} />
          <View style={styles.titleText}>{heading}</View>
        </View>
      ) : (
        heading
      )}
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

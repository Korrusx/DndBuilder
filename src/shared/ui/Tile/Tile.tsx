import { Pressable, View } from 'react-native';

import { colors } from '@/shared/config';

import { AppText } from '../AppText/AppText';
import { GameIcon } from '../GameIcon/GameIcon';
import { IconPattern } from '../IconPattern/IconPattern';
import { styles } from './Tile.styles';
import type { TileProps } from './Tile.types';

/** Компактная плитка варианта (предыстория): иконка, название и одна строка. */
export function Tile({ title, subtitle, tag, icon, selected, onPress }: TileProps) {
  const text = (
    <View style={styles.text}>
      {tag ? (
        <AppText style={styles.tag} numberOfLines={1}>
          {tag}
        </AppText>
      ) : null}
      <AppText style={[styles.title, selected && styles.titleSelected]} numberOfLines={1} adjustsFontSizeToFit>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="secondary" style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        icon && styles.tileIcon,
        selected && styles.tileSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon && !selected ? <IconPattern icon={icon} color={colors.textSecondary} /> : null}
      {icon ? <GameIcon name={icon} size={18} color={selected ? colors.accent : colors.textSecondary} /> : null}
      {text}
    </Pressable>
  );
}

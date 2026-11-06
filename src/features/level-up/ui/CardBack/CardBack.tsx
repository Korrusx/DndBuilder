import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { CARD_ICONS, CARD_THEMES } from '../../config/cardTheme';
import { Stripes } from '../Stripes/Stripes';
import { styles } from './CardBack.styles';
import type { CardBackProps } from './CardBack.types';

/** Рубашка карты: полосы цвета типа, иконка, подпись; точка — нужен выбор. */
export function CardBack({ type, label, dot, small, current, note, sub, open, style }: CardBackProps) {
  const theme = CARD_THEMES[type];
  const wide = !!note || !!sub;
  return (
    <View
      style={[
        styles.card,
        small && styles.small,
        wide && styles.wide,
        current && styles.current,
        {
          borderColor: current ? theme.accent : theme.border,
          borderStyle: theme.dashed ? 'dashed' : 'solid',
          backgroundColor: theme.background,
        },
        style,
      ]}
    >
      {open || theme.dashed ? null : <Stripes colors={theme.stripes} />}
      {dot ? <View style={styles.dot} /> : null}
      {note ? <Text style={[styles.note, { color: theme.accent }]}>{note}</Text> : null}
      {small || wide ? null : (
        <Feather name={CARD_ICONS[type] as ComponentProps<typeof Feather>['name']} size={24} color={theme.icon} />
      )}
      <Text
        numberOfLines={2}
        style={[small ? styles.smallLabel : wide ? styles.wideLabel : styles.label, !wide && { color: theme.accent }]}
      >
        {label}
      </Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

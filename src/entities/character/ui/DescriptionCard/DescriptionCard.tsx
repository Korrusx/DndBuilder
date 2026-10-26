import { View } from 'react-native';

import { colors } from '@/shared/config';
import { AppText, Badge, GameIcon } from '@/shared/ui';

import { styles } from './DescriptionCard.styles';
import type { DescriptionBlockProps, DescriptionCardProps } from './DescriptionCard.types';

/** Карточка описания под плитками (класс, вид, предыстория): шапка, блоки от главного к деталям. */
export function DescriptionCard({ icon, title, subtitle, aside, badge, children, footer }: DescriptionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        {icon ? <GameIcon name={icon} size={36} color={colors.accent} /> : null}
        <View style={styles.headText}>
          <AppText variant="heading">{title}</AppText>
          {subtitle ? <AppText variant="secondary">{subtitle}</AppText> : null}
        </View>
        {aside}
      </View>
      {badge ? (
        <View style={styles.badgeRow}>
          <Badge label={badge} />
        </View>
      ) : null}
      {children}
      {footer}
    </View>
  );
}

/** Блок карточки с заголовком («Что вы получите на 1-м уровне»). */
export function DescriptionBlock({ title, children }: DescriptionBlockProps) {
  return (
    <View style={styles.block}>
      <AppText variant="secondary" style={styles.blockTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

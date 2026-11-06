import { Image, Text, View } from 'react-native';

import { rarityColors } from '@/shared/config';
import { t } from '@/shared/i18n';

import { styles } from './HeroCard.styles';
import type { HeroCardProps } from './HeroCard.types';

/** Карточка героя итога и картинки «Поделиться»: кто, новый уровень, главные изменения, кампания, знак канала. */
export function HeroCard({
  name,
  letter,
  portrait,
  subtitle,
  level,
  rows,
  campaignLine,
  capstone,
  share,
}: HeroCardProps) {
  const accent = capstone ? rarityColors.legendary : undefined;
  return (
    <View style={[styles.card, share && styles.share, accent && { borderColor: accent }]}>
      <View style={styles.glow} />
      <View style={styles.head}>
        <View style={[styles.avatar, accent && { borderColor: accent }]}>
          {portrait ? (
            <Image source={{ uri: portrait }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.letter, accent && { color: accent }]}>{letter}</Text>
          )}
        </View>
        <View style={styles.who}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.level}>
          <Text style={[styles.levelNumber, accent && { color: accent }]}>{level}</Text>
          <Text style={styles.levelCaption}>
            {(capstone ? t('levelUpDeck.done.legend') : t('levelUpDeck.level')).toLocaleUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>
              {row.label}
            </Text>
            {row.before ? (
              <>
                <Text style={styles.before}>{row.before}</Text>
                <Text style={styles.arrow}>→</Text>
              </>
            ) : null}
            <Text style={[styles.after, accent && { color: accent }]}>{row.after}</Text>
          </View>
        ))}
      </View>
      <View style={styles.foot}>
        <Text style={styles.campaign} numberOfLines={1}>
          {campaignLine ?? ''}
        </Text>
        <Text style={styles.brand}>
          <Text style={{ color: accent ?? '#F2B14A' }}>КУБИ</Text>КОД
        </Text>
      </View>
    </View>
  );
}

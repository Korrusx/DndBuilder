import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { formatDamage, formatModifier } from '@/shared/lib/dice';
import { d20Parts } from '@/features/roll-dice';
import { AppText, Card, SmallButton } from '@/shared/ui';

import { damageTypeName } from '../../lib/damageType';
import { styles } from './UnarmedCard.styles';
import type { UnarmedCardProps } from './UnarmedCard.types';

export function UnarmedCard({
  toHit,
  damage,
  brawler,
  strMod,
  rageDamage,
  exhaustion,
  onRoll,
  onDamage,
}: UnarmedCardProps) {
  const { t } = useTranslation();
  const brawlerDamage = formatDamage('1d4', strMod + rageDamage);
  const unarmedDamage = brawler ? brawlerDamage : String(damage);

  return (
    <Card style={{ gap: 8 }}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">{t('combat.unarmed')}</AppText>
          <AppText variant="secondary">
            {t('combat.unarmedDamage', { damage: unarmedDamage, type: damageTypeName('bludgeoning') })}
          </AppText>
        </View>
        <SmallButton
          title={t('combat.attack', { value: formatModifier(toHit) })}
          tone="accent"
          onPress={() =>
            onRoll({
              title: t('combat.unarmed'),
              parts: d20Parts([{ label: t('combat.hit'), value: toHit }], exhaustion),
            })
          }
        />
        {brawler ? (
          <SmallButton
            title={t('combat.damageShort')}
            tone="damage"
            onPress={() =>
              onDamage({
                title: t('combat.unarmed'),
                dice: '1d4',
                bonus: strMod + rageDamage,
                damageType: damageTypeName('bludgeoning'),
              })
            }
          />
        ) : null}
      </View>
    </Card>
  );
}

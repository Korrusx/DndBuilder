import { View } from 'react-native';

import { nameOf } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDice } from '@/shared/lib/dice';
import { AppText, Card, SmallButton } from '@/shared/ui';

import type { SneakAttackCardProps } from './SneakAttackCard.types';

export function SneakAttackCard({ diceCount, diceSides, onDamage }: SneakAttackCardProps) {
  const { t } = useTranslation();
  const featureName = nameOf('features', 'rogue-sneak-attack');

  return (
    <Card style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">{featureName}</AppText>
          <AppText variant="secondary">{t('combat.sneakHint')}</AppText>
        </View>
        <SmallButton
          title={formatDice({ count: diceCount, sides: diceSides })}
          tone="damage"
          onPress={() => onDamage({ title: featureName, dice: `${diceCount}d${diceSides}`, bonus: 0 })}
        />
      </View>
    </Card>
  );
}

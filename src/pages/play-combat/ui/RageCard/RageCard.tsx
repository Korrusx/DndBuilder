import { View } from 'react-native';

import { localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Card, SmallButton } from '@/shared/ui';

import type { RageCardProps } from './RageCard.types';

const styles = { row: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }, fill: { flex: 1 } };

export function RageCard({ rage, rageLeft, rageBonus, isRaging, onStart, onEnd }: RageCardProps) {
  const { t } = useTranslation();
  return (
    <Card style={{ gap: 8 }}>
      <View style={styles.row}>
        <View style={styles.fill}>
          <AppText variant="heading">{localizeText(rage.name).text}</AppText>
          <AppText variant="secondary">
            {isRaging
              ? t('combat.rageActive', { bonus: rageBonus })
              : t('combat.rageInactive', { left: rageLeft, max: rage.max })}
          </AppText>
        </View>
        {isRaging ? (
          <SmallButton title={t('combat.rageEnd')} onPress={onEnd} />
        ) : (
          <SmallButton title={t('combat.rageStart')} tone="accent" disabled={rageLeft === 0} onPress={onStart} />
        )}
      </View>
    </Card>
  );
}

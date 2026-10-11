import { View } from 'react-native';

import type { ResourceView } from '@/entities/character';
import { adjustResource } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { tr } from '@/shared/content';
import { AppText, Card, Dots, SmallButton } from '@/shared/ui';

import { MAX_DOTS, RECOVERY } from '../../config/constants';
import { styles } from './ResourcesCard.styles';
import type { ResourcesCardProps } from './ResourcesCard.types';

export function ResourcesCard({ resources }: ResourcesCardProps) {
  const { updateState } = usePlay();
  if (!resources.length) return null;
  const adjust = (r: ResourceView, delta: number) => updateState((s) => adjustResource(s, r.id, delta, r.max));

  return (
    <Card>
      <AppText variant="heading">Ресурсы</AppText>
      <AppText variant="secondary">Закрашенный кружок — потраченное использование. Нажмите, чтобы потратить или вернуть.</AppText>
      {resources.map((r) => {
        const left = r.max - r.spent;
        const note = [r.die ? `к${r.die}` : '', `восст.: ${RECOVERY[r.recovery]}`].filter(Boolean).join(' · ');
        return (
          <View key={r.id} style={styles.item}>
            <AppText>{tr(r.name).text}</AppText>
            <AppText variant="secondary" style={styles.note}>
              {note}
            </AppText>
            {r.max <= MAX_DOTS ? (
              <Dots total={r.max} filled={r.spent} onPress={(dot) => adjust(r, dot < r.spent ? -1 : 1)} />
            ) : (
              <View style={styles.counter}>
                <AppText style={styles.left}>
                  {left}
                  <AppText variant="secondary"> / {r.max}</AppText>
                </AppText>
                {r.max >= 20 ? <SmallButton title="−5" disabled={left === 0} onPress={() => adjust(r, 5)} /> : null}
                <SmallButton title="−1" disabled={left === 0} onPress={() => adjust(r, 1)} />
                <SmallButton title="+1" disabled={r.spent === 0} onPress={() => adjust(r, -1)} />
                {r.max >= 20 ? <SmallButton title="+5" disabled={r.spent === 0} onPress={() => adjust(r, -5)} /> : null}
              </View>
            )}
          </View>
        );
      })}
    </Card>
  );
}

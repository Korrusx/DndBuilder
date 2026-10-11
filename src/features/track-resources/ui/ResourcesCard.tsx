// Блок «Ресурсы» на листе: ярость, дикий облик, кости превосходства, наложение рук…

import { StyleSheet, View } from 'react-native';

import { usePlay } from '@/entities/character/model/CharacterContext';
import { adjustResource } from '@/entities/character/model/resources';
import type { ResourceRecovery, ResourceView } from '@/entities/character/model/types';
import { colors, fonts, spacing } from '@/shared/config/theme';
import { tr } from '@/shared/content/content';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Card } from '@/shared/ui/Card/Card';
import { Dots } from '@/shared/ui/Dots/Dots';
import { SmallButton } from '@/shared/ui/SmallButton/SmallButton';

/** Больше стольких использований — показываем счётчик вместо кружков. */
const MAX_DOTS = 10;

const RECOVERY: Record<ResourceRecovery, string> = {
  long: 'долгий отдых',
  short: 'короткий отдых',
  'short-one': '1 за короткий отдых, все за долгий',
};

export function ResourcesCard({ resources }: { resources: ResourceView[] }) {
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

const styles = StyleSheet.create({
  item: { gap: spacing.xs },
  note: { fontSize: 13 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  left: { flex: 1, fontFamily: fonts.displayBold, fontSize: 22, color: colors.accent },
});

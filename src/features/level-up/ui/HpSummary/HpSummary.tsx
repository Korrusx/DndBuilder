import { Text, View } from 'react-native';

import { formatModifier } from '@/shared/lib/dice';

import { hpBreakdownText } from '../../lib/cardText';
import { styles } from './HpSummary.styles';
import type { HpSummaryProps } from './HpSummary.types';

/** Хиты уровня: разбор «6 на кубике + 2 (ТЕЛ)», прибавка крупно и полоса «было → стало». */
export function HpSummary({ hp }: HpSummaryProps) {
  const total = Math.max(1, hp.maxAfter);
  const old = Math.min(hp.maxBefore, total);
  return (
    <View style={styles.box}>
      <View style={styles.top}>
        <Text style={styles.breakdown}>{hpBreakdownText(hp.breakdown)}</Text>
        <Text style={styles.gain}>{formatModifier(hp.gain)}</Text>
      </View>
      <View style={styles.bar}>
        <Text style={styles.from}>{hp.maxBefore}</Text>
        <View style={styles.track}>
          <View style={[styles.old, { flex: old }]} />
          <View style={[styles.added, { flex: Math.max(0, total - old) }]} />
        </View>
        <Text style={styles.to}>{hp.maxAfter}</Text>
      </View>
    </View>
  );
}

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { averageHitDie } from '@/entities/character';
import { t } from '@/shared/i18n';
import { formatDie } from '@/shared/lib/dice';

import { hpFormula } from '../../lib/cardText';
import { HpRow } from '../HpRow/HpRow';
import { HpSummary } from '../HpSummary/HpSummary';
import { DieShape } from './DieShape';
import { HP_CARD, styles } from './HpCard.styles';
import type { HpCardProps } from './HpCard.types';

/**
 * Карта хитов — всегда первая в колоде (шаг 3 нового потока). До броска развёрнута: кость, формула,
 * «Бросить к8», «Взять среднее», «Ввести свой кубик», встряхивание. После — строка «✓ Хиты 38 → 46 +8»;
 * нажатие на неё разворачивает разбор.
 */
export function HpCard(props: HpCardProps) {
  const { card, decided, expanded, showResult } = props;
  const hp = card.hp;
  if (!hp) {
    return null;
  }
  if (!expanded && !showResult) {
    return (
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: false }} onPress={props.onToggle}>
        <HpRow card={card} decided={decided} onRoll={props.onToggle} />
      </Pressable>
    );
  }
  const die = formatDie(hp.die);
  const showButtons = !decided || props.canReroll;
  const roll = (
    <Pressable key="roll" accessibilityRole="button" onPress={props.onRoll} style={styles.roll}>
      <MaterialCommunityIcons name="dice-multiple" size={20} color={HP_CARD.onAccent} />
      <Text style={styles.rollText}>
        {t(decided ? 'levelUpDeck.hpCard.reroll' : 'levelUpDeck.hpCard.roll', { die })}
      </Text>
    </Pressable>
  );
  const small = (key: string, label: string, onPress: () => void) => (
    <Pressable key={key} accessibilityRole="button" onPress={onPress} style={styles.small}>
      <Text style={styles.smallText}>{label}</Text>
    </Pressable>
  );
  const average = small('average', t('levelUpDeck.hpCard.average', { value: averageHitDie(hp.die) }), props.onAverage);
  const manual = small('manual', t('levelUpDeck.hpCard.manual'), props.onManual);
  // «Свои кубики»: ввод своего броска — первой большой кнопкой, «Бросить» — во втором ряду.
  const rollSmall = small('roll', t('levelUpDeck.hpCard.roll', { die }), props.onRoll);
  const manualBig = (
    <Pressable key="manual-big" accessibilityRole="button" onPress={props.onManual} style={styles.roll}>
      <Text style={styles.rollText}>{t('levelUpDeck.hpCard.manual')}</Text>
    </Pressable>
  );

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: true }}
        onPress={props.onToggle}
        hitSlop={{ top: 12, bottom: 12 }}
        style={styles.head}
      >
        <View style={styles.square} />
        <Text style={styles.kicker} numberOfLines={1}>
          {t('levelUpDeck.hpCard.kicker', { die }).toLocaleUpperCase()}
        </Text>
        {!decided ? <Text style={styles.first}>{t('levelUpDeck.hpCard.first')}</Text> : null}
      </Pressable>

      {decided ? (
        <HpSummary hp={hp} />
      ) : (
        <View style={styles.row}>
          <View accessible accessibilityLabel={t('levelUpDeck.hpCard.a11yDie', { die })}>
            <DieShape sides={hp.die} />
          </View>
          <View style={styles.lines}>
            <Text style={styles.formula}>{hpFormula(card)}</Text>
            <Text style={styles.explain}>{t('levelUpDeck.hpCard.explain', { hp: hp.maxBefore })}</Text>
          </View>
        </View>
      )}

      {showButtons && !showResult ? (
        <>
          {props.ownDice ? manualBig : roll}
          <View style={styles.grid}>{props.ownDice ? [rollSmall, average] : [average, manual]}</View>
          {!decided ? <Text style={styles.shake}>{t('levelUpDeck.hpCard.shake')}</Text> : null}
        </>
      ) : null}
    </View>
  );
}

import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CardBack, LevelRing } from '@/features/level-up';
import { t } from '@/shared/i18n';

import { backLabel } from '../../lib/deckScreen';
import { JumpingBack } from './JumpingBack';
import { styles } from './StartStep.styles';
import type { StartStepProps } from './StartStep.types';

const MAX_BACKS = 5;

/** У1 · Новый уровень: кольцо уровня, «<Имя> растёт», рубашки колоды, выбор класса. */
export function StartStep(props: StartStepProps) {
  const { name, subtitle, from, to, cards, hasNext, capstone, animate } = props;
  const [playKey, setPlayKey] = useState(0);
  const [jumpKey, setJumpKey] = useState(0);
  const shown = cards.slice(0, hasNext ? MAX_BACKS - 1 : MAX_BACKS);
  const rest = cards.length - shown.length;

  const onSwap = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setJumpKey((k) => k + 1);
  };

  return (
    <>
      <View style={styles.top}>
        <View style={styles.glow} pointerEvents="none" />
        <LevelRing
          from={from}
          to={to}
          animate={animate}
          capstone={capstone}
          playKey={playKey}
          onPress={() => setPlayKey((k) => k + 1)}
          onSwap={onSwap}
        />
        <View style={styles.who}>
          <Text style={styles.name}>{t('levelUpDeck.grows', { name })}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.backs}>
        {shown.map((card, i) => (
          <JumpingBack key={card.id} jumpKey={jumpKey} index={i} animate={animate}>
            <CardBack
              type={card.type}
              label={backLabel(card)}
              dot={!!card.choice && card.choice.required}
              style={styles.back}
            />
          </JumpingBack>
        ))}
        {rest > 0 ? (
          <JumpingBack jumpKey={jumpKey} index={shown.length} animate={animate}>
            <CardBack type="growth" label={`+${rest}`} style={styles.back} />
          </JumpingBack>
        ) : null}
        {hasNext ? (
          <JumpingBack jumpKey={jumpKey} index={shown.length + 1} animate={animate}>
            <CardBack type="summary" label={t('levelUpDeck.whatNext')} style={styles.back} />
          </JumpingBack>
        ) : null}
      </View>
      {cards.some((card) => card.choice?.required) ? (
        <Text style={styles.dotHint}>{t('levelUpDeck.dotHint')}</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.caption}>{t('levelUpDeck.whichClass').toLocaleUpperCase()}</Text>
        <View style={styles.classes} accessibilityRole="radiogroup">
          {[
            { option: props.current, on: !props.isOther, press: props.onCurrent },
            { option: props.other, on: props.isOther, press: props.onOther },
          ].map(({ option, on, press }) => (
            <Pressable
              key={option.sub}
              accessibilityRole="radio"
              accessibilityState={{ checked: on, disabled: !!props.classLocked }}
              disabled={!!props.classLocked && !on}
              onPress={press}
              style={[styles.classButton, on && styles.classOn]}
            >
              <Text style={styles.classTitle}>{option.title}</Text>
              <Text style={[styles.classSub, on && styles.classSubOn]}>{option.sub}</Text>
            </Pressable>
          ))}
        </View>
        {props.classLocked ? <Text style={styles.locked}>{props.classLocked}</Text> : null}
      </View>
    </>
  );
}

import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { HeroCard } from '@/features/level-up';
import { colors } from '@/shared/config';
import { t } from '@/shared/i18n';

import { styles } from './DoneStep.styles';
import type { DoneStepProps } from './DoneStep.types';

/** У5 · Итог: карточка героя, плашка хроники, «На следующем уровне». */
export function DoneStep(props: DoneStepProps) {
  return (
    <>
      <Text style={styles.title}>{t('levelUpDeck.done.title')}</Text>
      <HeroCard
        name={props.name}
        letter={props.letter}
        portrait={props.portrait}
        subtitle={props.subtitle}
        level={props.level}
        rows={props.rows}
        campaignLine={props.campaignLine}
        capstone={props.capstone}
      />
      {props.chronicleText ? (
        <View style={styles.chronicle}>
          <Feather name="check" size={16} color={colors.heal} />
          <Text style={styles.chronicleText}>{props.chronicleText}</Text>
        </View>
      ) : null}
      {props.nextLevel ? (
        <View style={styles.next}>
          <Text style={styles.nextCaption}>
            {t('levelUpDeck.done.nextLevel', { level: props.nextLevel.level }).toLocaleUpperCase()}
          </Text>
          <Text style={styles.nextText}>{props.nextLevel.text}</Text>
        </View>
      ) : null}
    </>
  );
}

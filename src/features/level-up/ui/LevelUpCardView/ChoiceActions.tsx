import { Pressable, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { t } from '@/shared/i18n';

import { DECK_MOTION } from '../../config/constants';
import { DECK_COLORS } from '../../config/deckColors';
import { styles } from './LevelUpCardView.styles';
import type { ChoiceActionsProps } from './ChoiceActions.types';
import { PickedChips } from './PickedChips';

/** До выбора — «Выбрать…» (и «Не менять» у необязательного), после — чипы выбранного и «Изменить». */
export function ChoiceActions({
  choice,
  picked,
  kept,
  chooseTitle,
  magic,
  animate,
  onChoose,
  onKeep,
}: ChoiceActionsProps) {
  const colors = DECK_COLORS[magic ? 'magic' : 'choice'];
  if (picked.length || (kept && !choice.required)) {
    const items = picked.length ? picked : [{ id: 'kept', name: t('levelUpDeck.kept') }];
    return (
      <Animated.View entering={animate ? FadeIn.duration(DECK_MOTION.chips) : undefined}>
        <PickedChips items={items} magic={magic} onChange={() => onChoose(choice)} />
      </Animated.View>
    );
  }
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChoose(choice)}
        style={[styles.choose, { backgroundColor: colors.accent }]}
      >
        <Text style={styles.chooseText}>{chooseTitle}</Text>
      </Pressable>
      {!choice.required ? (
        <Pressable accessibilityRole="button" onPress={() => onKeep(choice)} style={styles.keep}>
          <Text style={styles.keepText}>{t('levelUpDeck.keep')}</Text>
        </Pressable>
      ) : null}
    </>
  );
}

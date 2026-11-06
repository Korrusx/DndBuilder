import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';

import { CHIP_HIT_SLOP } from '../../config/constants';
import { DECK_COLORS, DECK_UI } from '../../config/deckColors';
import { ChipList } from '../ChipList/ChipList';
import { styles } from './LevelUpCardView.styles';
import type { PickedChipsProps } from './PickedChips.types';

/** Выбранное чипами и чип «Изменить» (разделы 6.3 и 6.4). У магии — кружок с кругом заклинания. */
export function PickedChips({ items, magic, onChange }: PickedChipsProps) {
  const chip = magic
    ? { backgroundColor: DECK_UI.spellChip, borderColor: DECK_UI.spellChipBorder }
    : { backgroundColor: DECK_UI.accentPlate, borderColor: DECK_UI.choiceChipBorder };
  const text = magic ? DECK_UI.spellChipText : DECK_UI.choiceChipText;
  const accent = magic ? DECK_COLORS.magic.accent : DECK_UI.accent;
  return (
    <ChipList moreColor={accent} height={32}>
      {[
        ...items.map((item) => (
          <View key={item.id} style={[styles.picked, chip]}>
            {magic && item.circle ? (
              <View style={[styles.circle, { backgroundColor: accent }]}>
                <Text style={[styles.circleText, { color: DECK_UI.spellCircleText }]}>{item.circle}</Text>
              </View>
            ) : null}
            <Text style={[styles.pickedText, { color: text }]}>{item.name}</Text>
          </View>
        )),
        <Pressable
          key="change"
          accessibilityRole="button"
          onPress={onChange}
          hitSlop={CHIP_HIT_SLOP}
          style={[styles.change, { borderColor: magic ? DECK_COLORS.magic.border : DECK_UI.choiceChipBorder }]}
        >
          <Text style={[styles.changeText, { color: accent }]}>{t('levelUpDeck.screen.change')}</Text>
        </Pressable>,
      ]}
    </ChipList>
  );
}

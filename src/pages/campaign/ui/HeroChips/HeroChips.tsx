import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { firstLetter, heroLabel } from '../../lib/helpers';
import { styles } from './HeroChips.styles';
import type { HeroChipsProps } from './HeroChips.types';

/** Чипы действующих героев («Ирма · плут 5») и «Зал героев · N». */
export function HeroChips({ heroes, hallCount, onHero, onHall }: HeroChipsProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      {heroes.map((hero) => (
        <Pressable
          key={hero.character.id}
          accessibilityRole="button"
          onPress={() => onHero(hero)}
          style={[styles.chip, styles.hero]}
        >
          <View style={styles.letter}>
            <AppText style={styles.letterText}>{firstLetter(hero.character.name)}</AppText>
          </View>
          <AppText style={styles.heroText}>{heroLabel(hero.character)}</AppText>
        </Pressable>
      ))}
      {hallCount > 0 ? (
        <Pressable accessibilityRole="button" onPress={onHall} style={[styles.chip, styles.hall]}>
          <MaterialCommunityIcons name="grave-stone" size={16} color={colors.textSecondary} />
          <AppText style={styles.hallText}>{t('chronicle.hall.chip', { count: hallCount })}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

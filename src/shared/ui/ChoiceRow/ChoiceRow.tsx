import { Pressable, View } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';

import { AppText } from '../AppText/AppText';
import { GameIcon } from '../GameIcon/GameIcon';
import { styles } from './ChoiceRow.styles';
import type { ChoiceRowProps } from './ChoiceRow.types';

/**
 * Строка выбора с двумя зонами нажатия: строка (название, сводка, ›) открывает описание,
 * кружок справа выбирает или снимает выбор.
 */
export function ChoiceRow({
  title,
  summary,
  tags,
  selected,
  disabled,
  reason,
  icon,
  mark = 'check',
  onOpen,
  onToggle,
}: ChoiceRowProps) {
  const { t } = useTranslation();
  const blocked = !!disabled && !selected;
  const line = [blocked ? reason : undefined, summary].filter(Boolean).join(' · ');
  return (
    <View style={[styles.row, selected && styles.rowSelected]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[title, line].filter(Boolean).join('. ')}
        accessibilityHint={t('choiceRow.openHint')}
        onPress={onOpen}
        style={({ pressed }) => [styles.main, pressed && { opacity: 0.7 }]}
      >
        {icon ? <GameIcon name={icon} size={26} color={selected ? colors.accent : colors.textSecondary} /> : null}
        <View style={[styles.text, blocked && styles.dimmed]}>
          <View style={styles.titleLine}>
            <AppText style={[styles.title, selected && styles.titleSelected]} numberOfLines={1}>
              {title}
            </AppText>
            {tags?.map((tag) => (
              <View key={tag} style={styles.tag}>
                <AppText style={styles.tagLabel}>{tag}</AppText>
              </View>
            ))}
          </View>
          {line ? (
            <AppText style={styles.summary} numberOfLines={1} ellipsizeMode="tail">
              {line}
            </AppText>
          ) : null}
        </View>
        <AppText style={styles.chevron}>›</AppText>
      </Pressable>
      <Pressable
        accessibilityRole={mark === 'add' ? 'button' : 'checkbox'}
        accessibilityLabel={t(mark === 'add' ? 'choiceRow.add' : 'choiceRow.select', { name: title })}
        accessibilityState={{ checked: selected, disabled: blocked }}
        disabled={blocked}
        onPress={onToggle}
        style={({ pressed }) => [styles.check, pressed && { opacity: 0.7 }]}
      >
        <View
          style={[
            styles.circle,
            mark === 'add' && styles.circleAdd,
            selected && styles.circleSelected,
            blocked && styles.dimmed,
          ]}
        >
          {selected ? <AppText style={styles.checkMark}>✓</AppText> : null}
          {mark === 'add' ? <AppText style={styles.plusMark}>+</AppText> : null}
        </View>
      </Pressable>
    </View>
  );
}

import { View } from 'react-native';

import { MAX_LEVEL, multiclassShortfall } from '@/features/level-up';
import { content, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';
import { BottomSheet } from '@/shared/ui';

import { ClassRow } from './ClassRow';
import { styles } from './ClassSheet.styles';
import type { ClassSheetProps } from './ClassSheet.types';

/**
 * «Взять уровень в другом классе»: уже взятые классы и новые (мультикласс). Новые, требованиям которых
 * персонаж не соответствует, — серым, с причиной («нужна ИНТ 13, у вас 12»).
 */
export function ClassSheet({ visible, character, classId, onPick, onClose }: ClassSheetProps) {
  const own = character.classes.map((entry) => ({
    id: entry.classId,
    name: t('levelUpDeck.classLevel', { className: nameOf('classes', entry.classId), level: entry.level + 1 }),
    note: t('levelUpDeck.ritual.continuePath'),
    disabled: entry.level >= MAX_LEVEL,
  }));
  const fresh = content.classes
    .filter((cls) => !character.classes.some((entry) => entry.classId === cls.id))
    .map((cls) => {
      const reason = multiclassShortfall(character, content, cls.id);
      return {
        id: cls.id,
        name: t('levelUpDeck.classLevel', { className: nameOf('classes', cls.id), level: 1 }),
        note: reason || t('levelUpDeck.ritual.newClass'),
        disabled: !!reason,
      };
    })
    // Доступные — выше.
    .sort((a, b) => Number(a.disabled) - Number(b.disabled));
  return (
    <BottomSheet visible={visible} title={t('levelUpDeck.ritual.sheetTitle')} onClose={onClose}>
      <View style={styles.list}>
        {[...own, ...fresh].map((row) => (
          <ClassRow
            key={row.id}
            name={row.name}
            note={row.note}
            selected={row.id === classId}
            disabled={row.disabled}
            onPress={() => onPick(row.id)}
          />
        ))}
      </View>
    </BottomSheet>
  );
}

import { View } from 'react-native';

import { canMulticlassInto, MAX_LEVEL, multiclassRequirementText } from '@/features/level-up';
import { content, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';
import { AppText, BottomSheet, Chip, ChipRow } from '@/shared/ui';

import { styles } from './ClassSheet.styles';
import type { ClassSheetProps } from './ClassSheet.types';

/** «Другой класс»: свои классы и новые (мультикласс) с текущей проверкой требований. */
export function ClassSheet({ visible, character, classId, onPick, onClose }: ClassSheetProps) {
  return (
    <BottomSheet visible={visible} title={t('levelUpDeck.otherClass')} onClose={onClose}>
      <View style={styles.gap}>
        {character.classes.length > 1 ? (
          <ChipRow>
            {character.classes.map((e) => (
              <Chip
                key={e.classId}
                label={t('levelUpDeck.classLevel', { className: nameOf('classes', e.classId), level: e.level + 1 })}
                selected={classId === e.classId}
                disabled={e.level >= MAX_LEVEL}
                onPress={() => onPick(e.classId)}
              />
            ))}
          </ChipRow>
        ) : null}
        <AppText variant="secondary">{t('levelUpDeck.otherClassHint')}</AppText>
        <ChipRow>
          {content.classes
            .filter((cls) => !character.classes.some((e) => e.classId === cls.id))
            .map((cls) => {
              const ok = canMulticlassInto(character, content, cls.id);
              return (
                <Chip
                  key={cls.id}
                  label={nameOf('classes', cls.id)}
                  note={
                    ok ? undefined : t('levelUpDeck.requirement', { text: multiclassRequirementText(cls.id, content) })
                  }
                  selected={classId === cls.id}
                  disabled={!ok}
                  onPress={() => onPick(cls.id)}
                />
              );
            })}
        </ChipRow>
      </View>
    </BottomSheet>
  );
}

import { View } from 'react-native';

import { describeSubclass } from '@/entities/character';
import { SubclassCard } from '@/entities/character/ui';
import { levelUpPlan } from '@/features/level-up';
import { content, localizeText } from '@/shared/content';
import { t } from '@/shared/i18n';
import { FadeSwap, OptionCard } from '@/shared/ui';

import { styles } from './editors.styles';
import type { EditorProps } from './editors.types';

/** Подкласс: варианты класса и описание выбранного (экран из прежнего мастера повышения). */
export function SubclassEditor({ choice, next, set }: EditorProps) {
  const plan = levelUpPlan(next, content, choice.classId);
  const entry = next.classes.find((e) => e.classId === choice.classId);
  const subclass = entry?.subclassId ? describeSubclass(entry.subclassId, content, plan.toLevel) : undefined;
  const pick = (subclassId: string) =>
    set((c) => ({ ...c, classes: c.classes.map((e) => (e.classId === choice.classId ? { ...e, subclassId } : e)) }));
  return (
    <View style={styles.gap}>
      {content.subclasses
        .filter((s) => s.classId === choice.classId)
        .map((s) => (
          <OptionCard
            key={s.id}
            title={localizeText(s.name).text}
            lines={[localizeText(s.summary).text, ...(s.extra ? [t('common.fromPhb')] : [])]}
            selected={entry?.subclassId === s.id}
            onPress={() => pick(s.id)}
          />
        ))}
      <FadeSwap swapKey={entry?.subclassId ?? ''}>{subclass ? <SubclassCard description={subclass} /> : null}</FadeSwap>
    </View>
  );
}

// Смена заговоров и подготовленных заклинаний в пределах лимитов текущего уровня.

import { View } from 'react-native';

import { spellLimits, spellOptions } from '@/entities/character/model/build';
import type { Character } from '@/entities/character/model/types';
import { spacing } from '@/shared/config/theme';
import { content } from '@/shared/content/content';
import { spellName } from '@/shared/content/names';
import { MultiPick, Section } from '@/shared/ui/_split/wizard-ui';
import { AppText } from '@/shared/ui/AppText/AppText';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';

export function SpellsEditSheet({
  visible,
  character: c,
  onChange,
  onClose,
}: {
  visible: boolean;
  character: Character;
  onChange: (patch: Pick<Character, 'cantrips' | 'preparedSpells'>) => void;
  onClose: () => void;
}) {
  const limits = spellLimits(c, content);
  if (!limits) return null;
  const circles = Array.from({ length: limits.maxSpellLevel }, (_, i) => i + 1);

  return (
    <BottomSheet visible={visible} title="Заклинания" onClose={onClose}>
      <AppText variant="secondary">
        Подготовленные заклинания можно менять после долгого отдыха (волшебник — из книги заклинаний, бард, чародей и колдун —
        при повышении уровня).
      </AppText>
      {limits.cantrips > 0 ? (
        <Section title="Заговоры" picked={c.cantrips.length} need={limits.cantrips}>
          <MultiPick
            options={spellOptions(limits.classId, 0, content)}
            selected={c.cantrips}
            max={limits.cantrips}
            label={spellName}
            onChange={(cantrips) => onChange({ cantrips, preparedSpells: c.preparedSpells })}
          />
        </Section>
      ) : null}
      <Section title="Подготовленные" picked={c.preparedSpells.length} need={limits.prepared}>
        <View style={{ gap: spacing.md }}>
          {circles.map((circle) => {
            const options = spellOptions(limits.classId, circle, content);
            const inCircle = c.preparedSpells.filter((id) => options.includes(id));
            const others = c.preparedSpells.length - inCircle.length;
            return (
              <View key={circle} style={{ gap: spacing.sm }}>
                <AppText variant="secondary">{circle} круг</AppText>
                <MultiPick
                  options={options}
                  selected={inCircle}
                  // Общий лимит на все круги: здесь можно выбрать столько, сколько осталось после других кругов.
                  max={Math.max(inCircle.length, limits.prepared - others)}
                  label={spellName}
                  onChange={(ids) =>
                    onChange({
                      cantrips: c.cantrips,
                      preparedSpells: [...c.preparedSpells.filter((id) => !options.includes(id)), ...ids],
                    })
                  }
                />
              </View>
            );
          })}
        </View>
      </Section>
    </BottomSheet>
  );
}

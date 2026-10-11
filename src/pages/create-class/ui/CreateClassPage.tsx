import { StyleSheet, View } from 'react-native';

import { setClass } from '@/entities/character/model/build';
import { useDraft } from '@/features/create-character/model/DraftContext';
import { WizardScreen } from '@/features/create-character/ui/WizardScreen/WizardScreen';
import { colors, fonts, spacing } from '@/shared/config/theme';
import { content } from '@/shared/content/content';
import { abilityAbbr, nameOf } from '@/shared/content/names';
import { AppText } from '@/shared/ui/AppText/AppText';
import { OptionCard } from '@/shared/ui/OptionCard/OptionCard';

export function CreateClassPage() {
  const { character, update } = useDraft();
  const selected = character.classes[0]?.classId;
  const cls = content.classes.find((c) => c.id === selected);

  const rows: (typeof content.classes)[] = [];
  for (let i = 0; i < content.classes.length; i += 2) rows.push(content.classes.slice(i, i + 2));

  return (
    <WizardScreen
      step={1}
      canContinue={!!cls}
      summary={
        cls ? (
          <AppText variant="secondary">
            Выбран: <AppText style={{ color: colors.text }}>{nameOf('classes', cls.id)}</AppText> · к{cls.hitDie}
          </AppText>
        ) : (
          <AppText variant="secondary">Выберите класс</AppText>
        )
      }
    >
      {rows.map((row) => (
        <View key={row[0].id} style={styles.row}>
          {row.map((c) => (
            <OptionCard
              key={c.id}
              compact
              selected={c.id === selected}
              onPress={() => update((d) => setClass(d, c.id))}
              title={
                <AppText style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
                  {nameOf('classes', c.id)}
                </AppText>
              }
              lines={[
                `Кость хитов к${c.hitDie}`,
                c.primaryAbilities.map(abilityAbbr).join(c.primaryAbilityChoice ? ' или ' : ' и '),
              ]}
            />
          ))}
        </View>
      ))}
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  name: { fontFamily: fonts.display, fontSize: 16, color: colors.text },
});

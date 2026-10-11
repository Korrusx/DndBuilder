import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { useDraft } from '@/components/wizard/DraftContext';
import { abilityAbbr, nameOf } from '@/components/wizard/names';
import { OptionCard, WizardScreen } from '@/components/wizard/ui';
import { content } from '@/content';
import { setClass } from '@/rules/creation';
import { colors, fonts, spacing } from '@/theme';

export default function CreateClassScreen() {
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

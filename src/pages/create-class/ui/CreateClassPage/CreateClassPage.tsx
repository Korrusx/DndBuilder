import { View } from 'react-native';

import { setClass } from '@/entities/character';
import { useDraft, WizardScreen } from '@/features/create-character';
import { abilityAbbr, byId, content, nameOf } from '@/shared/content';
import { AppText, OptionCard } from '@/shared/ui';

import { styles } from './CreateClassPage.styles';

export function CreateClassPage() {
  const { character, update } = useDraft();
  const selected = character.classes[0]?.classId;
  const cls = selected ? byId.classes.get(selected) : undefined;

  const rows: (typeof content.classes)[] = [];
  for (let i = 0; i < content.classes.length; i += 2) rows.push(content.classes.slice(i, i + 2));

  return (
    <WizardScreen
      step={1}
      canContinue={!!cls}
      summary={
        cls ? (
          <AppText variant="secondary">
            Выбран: <AppText style={styles.textText}>{nameOf('classes', cls.id)}</AppText> · к{cls.hitDie}
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

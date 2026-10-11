import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { usePlay } from '@/entities/character/model/CharacterContext';
import { exhaustionPenalty } from '@/entities/character/model/play';
import { D20Sheet, d20Parts, type D20Request } from '@/features/roll-dice/ui/RollSheet';
import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { abilityAbbr, abilityName, groupSkillsByAbility, nameOf } from '@/shared/content/names';
import { formatModifier } from '@/shared/lib/dice/dice';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Screen } from '@/shared/ui/Screen/Screen';

export function PlaySkillsPage() {
  const { character: c, sheet } = usePlay();
  const [roll, setRoll] = useState<D20Request | null>(null);
  const ex = c.state.exhaustion;

  const open = (s: (typeof sheet.skills)[number]) => {
    const parts = [{ label: abilityAbbr(s.ability), value: sheet.abilities[s.ability].mod }];
    if (s.proficient) parts.push({ label: 'Владение', value: sheet.profBonus });
    if (s.expertise) parts.push({ label: 'Компетентность', value: sheet.profBonus });
    setRoll({ title: nameOf('skills', s.id), parts: d20Parts(parts, ex) });
  };

  return (
    <Screen>
      <AppText variant="secondary">
        Пассивное восприятие {sheet.passivePerception} · ● владение, ◆ компетентность
        {ex ? ` · истощение ${formatModifier(exhaustionPenalty(ex))} к броскам` : ''}
      </AppText>
      {groupSkillsByAbility(sheet.skills).map(({ ability, skills }) => {
        const a = sheet.abilities[ability];
        return (
          <View key={ability} style={styles.list}>
            <View style={styles.head}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setRoll({ title: `Проверка: ${abilityName(ability)}`, parts: d20Parts([{ label: abilityAbbr(ability), value: a.mod }], ex) })
                }
                style={{ flex: 1 }}
              >
                <AppText variant="heading">{abilityName(ability)}</AppText>
                <AppText variant="secondary">
                  Модификатор {formatModifier(a.mod)} · значение {a.score}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  const parts = [{ label: abilityAbbr(ability), value: a.mod }];
                  if (a.saveProficient) parts.push({ label: 'БМ', value: sheet.profBonus });
                  setRoll({ title: `Спасбросок: ${abilityName(ability)}`, parts: d20Parts(parts, ex) });
                }}
                style={[styles.save, a.saveProficient && { backgroundColor: colors.accentBg }]}
              >
                <AppText style={[styles.saveText, a.saveProficient && { color: colors.accent }]}>
                  Спас {formatModifier(a.save)}
                  {a.saveProficient ? ' ●' : ''}
                </AppText>
              </Pressable>
            </View>
            {skills.map((s) => (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                onPress={() => open(s)}
                style={({ pressed }) => [styles.row, styles.divider, pressed && { backgroundColor: colors.surface2 }]}
              >
                <AppText style={styles.mark}>{s.expertise ? '◆' : s.proficient ? '●' : ''}</AppText>
                <AppText style={{ flex: 1, color: s.proficient ? colors.text : colors.textSecondary }}>{nameOf('skills', s.id)}</AppText>
                <AppText style={styles.bonus}>{formatModifier(s.bonus + exhaustionPenalty(ex))}</AppText>
              </Pressable>
            ))}
          </View>
        );
      })}
      <D20Sheet request={roll} onClose={() => setRoll(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: sizes.touchMin + 4, paddingHorizontal: spacing.md, gap: spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  save: { minHeight: sizes.touchMin, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: 12, backgroundColor: colors.surface2 },
  saveText: { fontFamily: fonts.textMedium, fontSize: 14, color: colors.text },
  mark: { width: 16, color: colors.accent },
  bonus: { fontFamily: fonts.displayBold, fontSize: 17, color: colors.text, width: 44, textAlign: 'right' },
});

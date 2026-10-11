import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { usePlay } from '@/components/play/CharacterContext';
import { D20Sheet, d20Parts, type D20Request } from '@/components/play/RollSheet';
import { Screen } from '@/components/Screen';
import { abilityAbbr, nameOf } from '@/components/wizard/names';
import { formatModifier } from '@/rules/dice';
import { exhaustionPenalty } from '@/rules/play';
import { colors, fonts, radius, sizes, spacing } from '@/theme';

export default function SkillsTab() {
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
      <View style={styles.list}>
        {sheet.skills.map((s, i) => (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            onPress={() => open(s)}
            style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && { backgroundColor: colors.surface2 }]}
          >
            <AppText style={styles.mark}>{s.expertise ? '◆' : s.proficient ? '●' : ''}</AppText>
            <View style={{ flex: 1 }}>
              <AppText style={{ color: s.proficient ? colors.text : colors.textSecondary }}>{nameOf('skills', s.id)}</AppText>
            </View>
            <AppText variant="secondary" style={{ width: 44 }}>
              {abilityAbbr(s.ability)}
            </AppText>
            <AppText style={styles.bonus}>{formatModifier(s.bonus + exhaustionPenalty(ex))}</AppText>
          </Pressable>
        ))}
      </View>
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
  mark: { width: 16, color: colors.accent },
  bonus: { fontFamily: fonts.displayBold, fontSize: 17, color: colors.text, width: 44, textAlign: 'right' },
});

import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { exhaustionPenalty, knownLanguages, proficiencyGroups } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import type { D20Request } from '@/features/roll-dice';
import { d20Parts, D20Sheet } from '@/features/roll-dice';
import { colors } from '@/shared/config';
import { abilityAbbr, abilityName, content, groupSkillsByAbility, nameOf } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatModifier } from '@/shared/lib/dice';
import { AppText, Card, Screen } from '@/shared/ui';

import { styles } from './PlaySkillsPage.styles';

export function PlaySkillsPage() {
  const { character: c, sheet } = usePlay();
  const { t } = useTranslation();
  const [roll, setRoll] = useState<D20Request | null>(null);
  const ex = c.state.exhaustion;
  const profs = proficiencyGroups(sheet);

  const open = (s: (typeof sheet.skills)[number]) => {
    const parts = [{ label: abilityAbbr(s.ability), value: sheet.abilities[s.ability].mod }];
    if (s.proficient) parts.push({ label: t('skillsTab.proficiency'), value: sheet.profBonus });
    if (s.expertise) parts.push({ label: t('skillsTab.expertise'), value: sheet.profBonus });
    if (s.extra) parts.push({ label: t('skillsTab.feature'), value: s.extra });
    setRoll({ title: nameOf('skills', s.id), parts: d20Parts(parts, ex) });
  };

  return (
    <Screen>
      <AppText variant="secondary">
        {t('skillsTab.summary', { value: sheet.passivePerception })}
        {ex ? (c.edition === '2014' ? t('skillsTab.exhaustion2014') : t('skillsTab.exhaustion', { penalty: formatModifier(exhaustionPenalty(ex)) })) : ''}
      </AppText>
      {groupSkillsByAbility(sheet.skills).map(({ ability, skills }) => {
        const a = sheet.abilities[ability];
        return (
          <View key={ability} style={styles.list}>
            <View style={styles.head}>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setRoll({ title: t('sheet.rollTitle', { kind: t('sheet.check'), ability: abilityName(ability) }), parts: d20Parts([{ label: abilityAbbr(ability), value: a.mod }], ex) })
                }
                style={styles.fill}
              >
                <AppText variant="heading">{abilityName(ability)}</AppText>
                <AppText variant="secondary">
                  {t('skillsTab.modScore', { mod: formatModifier(a.mod), score: a.score })}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  const parts = [{ label: abilityAbbr(ability), value: a.mod }];
                  if (a.saveProficient) parts.push({ label: t('stats.pb'), value: sheet.profBonus });
                  setRoll({ title: t('sheet.rollTitle', { kind: t('sheet.save'), ability: abilityName(ability) }), parts: d20Parts(parts, ex) });
                }}
                style={[styles.save, a.saveProficient && { backgroundColor: colors.accentBg }]}
              >
                <AppText style={[styles.saveText, a.saveProficient && { color: colors.accent }]}>
                  {t('sheet.saveShort', { value: formatModifier(a.save) })}
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
                <AppText style={styles.bonus}>{formatModifier(s.bonus + exhaustionPenalty(ex, c.edition))}</AppText>
              </Pressable>
            ))}
          </View>
        );
      })}
      <Card style={styles.gapSm}>
        <AppText variant="heading">{t('skillsTab.proficiencies')}</AppText>
        {[
          { label: t('pdf.languages'), list: knownLanguages(c, content).map((id) => nameOf('languages', id)) },
          { label: t('pdf.armor'), list: profs.armor },
          { label: t('pdf.weapons'), list: profs.weapons },
          { label: t('pdf.tools'), list: profs.tools },
        ].map((row) => (
          <AppText key={row.label}>
            <AppText style={styles.muted}>{row.label}: </AppText>
            {row.list.length ? row.list.join(', ') : '—'}
          </AppText>
        ))}
        <AppText variant="secondary">{t('skillsTab.proficienciesHint')}</AppText>
      </Card>

      <D20Sheet request={roll} onClose={() => setRoll(null)} />
    </Screen>
  );
}

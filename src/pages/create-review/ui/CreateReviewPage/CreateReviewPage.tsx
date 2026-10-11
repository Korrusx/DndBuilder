import { safeSheet } from '@/entities/character';
import { draftIssues, useDraft, WizardScreen } from '@/features/create-character';
import { usePdfExport } from '@/features/export-pdf';
import { colors, fonts, spacing } from '@/shared/config';
import { content, nameOf, tr } from '@/shared/content';
import { AppText, Button, Chip, ChipRow, Section } from '@/shared/ui';
import { SheetPreview } from '@/widgets/sheet-preview';
import { Pressable, TextInput, View } from 'react-native';
import { styles } from './CreateReviewPage.styles';

export function CreateReviewPage() {
  const { character: c, update, goTo, finish } = useDraft();
  const pdf = usePdfExport();
  const issues = draftIssues(c, content);
  const blocking = issues.filter((i) => i.blocking);
  const sheet = issues.some((i) => i.blocking && i.step <= 2) ? null : safeSheet(c);
  const subtitle = [
    `${nameOf('classes', c.classes[0]?.classId)} 1`,
    nameOf('species', c.speciesId),
    nameOf('backgrounds', c.backgroundId),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <WizardScreen
      step={6}
      canContinue={blocking.length === 0}
      footer={
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Button
              title={pdf.busy ? 'PDF…' : 'PDF'}
              variant="secondary"
              disabled={pdf.busy || blocking.length > 0}
              onPress={() => pdf.run(c)}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Button title="Начать игру" disabled={blocking.length > 0} onPress={finish} />
          </View>
        </View>
      }
    >
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarLetter}>{(c.name.trim()[0] ?? '?').toUpperCase()}</AppText>
        </View>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <TextInput
            value={c.name}
            onChangeText={(name) => update((d) => ({ ...d, name }))}
            placeholder="Имя персонажа"
            placeholderTextColor={colors.textSecondary}
            style={styles.nameInput}
          />
          <AppText variant="secondary">{subtitle}</AppText>
        </View>
      </View>

      {issues.length ? (
        <View style={{ gap: spacing.sm }}>
          {issues.map((i) => (
            <View key={i.message} style={[styles.issue, !i.blocking && { backgroundColor: colors.infoBg }]}>
              <AppText style={{ flex: 1, color: i.blocking ? colors.damage : colors.info, fontSize: 14 }}>{i.message}</AppText>
              {i.step < 6 ? (
                <Pressable accessibilityRole="button" onPress={() => goTo(i.step)} style={styles.fix}>
                  <AppText style={{ color: colors.accent, fontFamily: fonts.textBold }}>Исправить</AppText>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <Section title="Мировоззрение">
        <ChipRow>
          {content.alignments.map((a) => (
            <Chip
              key={a.id}
              label={tr(a.name).text}
              selected={c.alignment === a.id}
              onPress={() => update((d) => ({ ...d, alignment: d.alignment === a.id ? undefined : a.id }))}
            />
          ))}
        </ChipRow>
      </Section>

      {sheet ? <SheetPreview c={c} sheet={sheet} /> : null}
    </WizardScreen>
  );
}

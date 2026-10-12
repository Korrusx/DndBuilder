import { Pressable, TextInput, View } from 'react-native';

import { safeSheet } from '@/entities/character';
import { useDraft, WizardScreen } from '@/features/create-character';
import { usePdfExport } from '@/features/export-pdf';
import { colors } from '@/shared/config';
import { content, nameOf, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Button, Chip, ChipRow, Section } from '@/shared/ui';
import { SheetPreview } from '@/widgets/sheet-preview';

import { styles } from './CreateReviewPage.styles';

export function CreateReviewPage() {
  const { character: c, issues, update, goTo, finish } = useDraft();
  const pdf = usePdfExport();
  const { t } = useTranslation();
  const blocking = issues.filter((i) => i.blocking);
  const sheet = issues.some((i) => i.blocking && i.step <= 2) ? null : safeSheet(c);
  const subtitle = [
    t('review.level1', { className: nameOf('classes', c.classes[0]?.classId) }),
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
          <View style={styles.fill}>
            <Button
              title={pdf.busy ? 'PDF…' : 'PDF'}
              variant="secondary"
              disabled={pdf.busy || blocking.length > 0}
              onPress={() => pdf.run(c)}
            />
          </View>
          <View style={styles.fill2}>
            <Button title={t('review.start')} disabled={blocking.length > 0} onPress={finish} />
          </View>
        </View>
      }
    >
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarLetter}>{(c.name.trim()[0] ?? '?').toUpperCase()}</AppText>
        </View>
        <View style={styles.heroText}>
          <TextInput
            value={c.name}
            onChangeText={(name) => update((d) => ({ ...d, name }))}
            placeholder={t('review.name')}
            placeholderTextColor={colors.textSecondary}
            style={styles.nameInput}
          />
          <AppText variant="secondary">{subtitle}</AppText>
        </View>
      </View>

      {issues.length ? (
        <View style={styles.gapSm}>
          {issues.map((i) => (
            <View key={i.message} style={[styles.issue, !i.blocking && { backgroundColor: colors.infoBg }]}>
              <AppText style={{ flex: 1, color: i.blocking ? colors.damage : colors.info, fontSize: 14 }}>{i.message}</AppText>
              {i.step < 6 ? (
                <Pressable accessibilityRole="button" onPress={() => goTo(i.step)} style={styles.fix}>
                  <AppText style={styles.linkLabel}>{t('review.fix')}</AppText>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      <Section title={t('review.alignment')}>
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

import { Pressable, TextInput, View } from 'react-native';

import { safeSheet } from '@/entities/character';
import { useDraft, WizardScreen } from '@/features/create-character';
import { usePdfExport } from '@/features/export-pdf';
import { colors } from '@/shared/config';
import { content, nameOf, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Button, Chip, ChipRow, Section } from '@/shared/ui';
import { SheetPreview } from '@/widgets/sheet-preview';

import { styles } from './CreateReviewPage.styles';

export function CreateReviewPage() {
  const { character, issues, update, goTo, finish } = useDraft();
  const pdf = usePdfExport();
  const { t } = useTranslation();
  const blocking = issues.filter((i) => i.blocking);
  const sheet = issues.some((i) => i.blocking && i.step <= 2) ? null : safeSheet(character);
  const subtitle = [
    t('review.level1', { className: nameOf('classes', character.classes[0]?.classId) }),
    nameOf('species', character.speciesId),
    nameOf('backgrounds', character.backgroundId),
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
              onPress={() => pdf.run(character)}
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
          <AppText style={styles.avatarLetter}>{(character.name.trim()[0] ?? '?').toUpperCase()}</AppText>
        </View>
        <View style={styles.heroText}>
          <TextInput
            value={character.name}
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
            <View key={i.message} style={[styles.issue, !i.blocking && styles.issueInfo]}>
              <AppText style={i.blocking ? styles.issueText : styles.issueTextInfo}>{i.message}</AppText>
              {i.step < 6 ? (
                <Pressable accessibilityRole="button" onPress={() => goTo(i.step, 6)} style={styles.fix}>
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
              label={localizeText(a.name).text}
              selected={character.alignment === a.id}
              onPress={() => update((d) => ({ ...d, alignment: d.alignment === a.id ? undefined : a.id }))}
            />
          ))}
        </ChipRow>
      </Section>

      {sheet ? <SheetPreview character={character} sheet={sheet} /> : null}
    </WizardScreen>
  );
}

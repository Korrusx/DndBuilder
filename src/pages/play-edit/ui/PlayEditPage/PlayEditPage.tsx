import { useState } from 'react';
import { Alert, TextInput } from 'react-native';

import type { Character } from '@/entities/character';
import { choice1, CHOICE_KEYS, knownLanguages, needsSpeciesSpellAbility, SPECIES_SPELL_ABILITIES } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { shareCharacters } from '@/features/transfer-characters';
import { colors } from '@/shared/config';
import { abilityName, content, nameOf, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { Chip, ChipRow, Screen, Section, SmallButton } from '@/shared/ui';

import type { TextField } from '../../model/types';
import { styles } from './PlayEditPage.styles';

/** Изменение данных персонажа, которые меняются по ходу игры: имя, кампания, мировоззрение, языки, заметки. */
export function PlayEditPage() {
  const { character: c, update } = usePlay();
  const { t } = useTranslation();
  const set = (patch: Partial<Character>) => update((d) => ({ ...d, ...patch }));
  const [sharing, setSharing] = useState(false);
  const exportToFile = async () => {
    setSharing(true);
    try {
      await shareCharacters([c]);
    } catch (err) {
      Alert.alert(t('edit.saveFailed'), err instanceof Error ? err.message : String(err));
    } finally {
      setSharing(false);
    }
  };

  const field = (key: TextField, placeholder: string, multiline = false) => (
    <TextInput
      value={c[key] ?? ''}
      onChangeText={(text) => set({ [key]: text })}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      multiline={multiline}
      style={[styles.input, multiline && styles.multiline]}
    />
  );

  // Языки от умений класса (воровской жаргон и т.п.) отмечены, но снять их нельзя.
  const known = new Set(knownLanguages(c, content));
  const toggleLanguage = (id: string) =>
    set({ languages: c.languages.includes(id) ? c.languages.filter((l) => l !== id) : [...c.languages, id] });

  return (
    <Screen>
      <Section title={t('edit.name')}>{field('name', t('edit.namePlaceholder'))}</Section>
      <Section title={t('edit.player')}>{field('player', t('edit.playerPlaceholder'))}</Section>
      <Section title={t('edit.campaign')}>{field('campaign', t('edit.campaignPlaceholder'))}</Section>

      <Section title={t('edit.alignment')}>
        <ChipRow>
          {content.alignments.map((a) => (
            <Chip
              key={a.id}
              label={tr(a.name).text}
              selected={c.alignment === a.id}
              onPress={() => set({ alignment: c.alignment === a.id ? undefined : a.id })}
            />
          ))}
        </ChipRow>
      </Section>

      <Section title={t('edit.languages')} hint={t('edit.languagesHint')}>
        <ChipRow>
          {content.languages.map((l) => (
            <Chip
              key={l.id}
              label={nameOf('languages', l.id)}
              selected={known.has(l.id)}
              disabled={known.has(l.id) && !c.languages.includes(l.id)}
              onPress={() => toggleLanguage(l.id)}
            />
          ))}
        </ChipRow>
      </Section>

      {needsSpeciesSpellAbility(c, content) ? (
        <Section title={t('origin.spellAbility')} hint={t('origin.spellAbilityHint')}>
          <ChipRow>
            {SPECIES_SPELL_ABILITIES.map((ability) => (
              <Chip
                key={ability}
                label={abilityName(ability)}
                selected={choice1(c, CHOICE_KEYS.speciesSpellAbility) === ability}
                onPress={() => set({ choices: { ...c.choices, [CHOICE_KEYS.speciesSpellAbility]: [ability] } })}
              />
            ))}
          </ChipRow>
        </Section>
      ) : null}

      <Section title={t('edit.notes')}>{field('notes', t('edit.notesPlaceholder'), true)}</Section>

      <Section title={t('edit.file')} hint={t('edit.fileHint')}>
        <SmallButton title={sharing ? t('edit.saving') : t('edit.saveToFile')} disabled={sharing} onPress={exportToFile} />
      </Section>
    </Screen>
  );
}

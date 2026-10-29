import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, TextInput } from 'react-native';

import type { ChronicleFile } from '@/entities/campaign';
import { exportChronicle, getCampaign, participationOf } from '@/entities/campaign/api';
import type { Character } from '@/entities/character';
import {
  choice1,
  CHOICE_KEYS,
  knownLanguages,
  needsSpeciesSpellAbility,
  SPECIES_SPELL_ABILITIES,
} from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { CampaignLink } from '@/features/join-campaign';
import { ClassOptionsPicker } from '@/features/pick-class-options';
import { shareCharacters } from '@/features/transfer-characters';
import { colors } from '@/shared/config';
import { abilityName, content, nameOf, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { confirm } from '@/shared/lib/confirm';
import { Chip, ChipRow, Screen, Section, SmallButton } from '@/shared/ui';

import type { TextField } from '../../model/types';
import { styles } from './PlayEditPage.styles';

/** Изменение данных персонажа, которые меняются по ходу игры: имя, кампания, мировоззрение, языки, воззвания, заметки. */
export function PlayEditPage() {
  const { character, update } = usePlay();
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const set = (patch: Partial<Character>) => update((d) => ({ ...d, ...patch }));
  const [sharing, setSharing] = useState(false);
  const exportToFile = async () => {
    setSharing(true);
    try {
      // Герой в кампании — предложить взять с собой и её хронику.
      const participation = await participationOf(db, character.id);
      const campaign = participation ? await getCampaign(db, participation.campaignId) : null;
      const chronicles: ChronicleFile[] = [];
      if (
        campaign &&
        (await confirm(
          t('chronicle.files.attachTitle'),
          t('chronicle.files.attach', { name: campaign.name }),
          t('chronicle.files.attachYes'),
          t('chronicle.files.attachNo'),
        ))
      ) {
        const file = await exportChronicle(db, campaign.id);
        if (file) {
          chronicles.push(file);
        }
      }
      await shareCharacters([character], chronicles);
    } catch (err) {
      Alert.alert(t('edit.saveFailed'), err instanceof Error ? err.message : String(err));
    } finally {
      setSharing(false);
    }
  };

  const field = (key: TextField, placeholder: string, multiline = false) => (
    <TextInput
      value={character[key] ?? ''}
      onChangeText={(text) => set({ [key]: text })}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      multiline={multiline}
      style={[styles.input, multiline && styles.multiline]}
    />
  );

  // Языки от умений класса (воровской жаргон и т.п.) отмечены, но снять их нельзя.
  const known = new Set(knownLanguages(character, content));
  const toggleLanguage = (id: string) =>
    set({
      languages: character.languages.includes(id)
        ? character.languages.filter((l) => l !== id)
        : [...character.languages, id],
    });

  return (
    <Screen>
      <Section title={t('edit.name')}>{field('name', t('edit.namePlaceholder'))}</Section>
      <Section title={t('edit.player')}>{field('player', t('edit.playerPlaceholder'))}</Section>
      <Section title={t('edit.campaign')}>
        <CampaignLink />
      </Section>

      <Section title={t('edit.alignment')}>
        <ChipRow>
          {content.alignments.map((a) => (
            <Chip
              key={a.id}
              label={localizeText(a.name).text}
              selected={character.alignment === a.id}
              onPress={() => set({ alignment: character.alignment === a.id ? undefined : a.id })}
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
              disabled={known.has(l.id) && !character.languages.includes(l.id)}
              onPress={() => toggleLanguage(l.id)}
            />
          ))}
        </ChipRow>
      </Section>

      {needsSpeciesSpellAbility(character, content) ? (
        <Section title={t('origin.spellAbility')} hint={t('origin.spellAbilityHint')}>
          <ChipRow>
            {SPECIES_SPELL_ABILITIES.map((ability) => (
              <Chip
                key={ability}
                label={abilityName(ability)}
                selected={choice1(character, CHOICE_KEYS.speciesSpellAbility) === ability}
                onPress={() => set({ choices: { ...character.choices, [CHOICE_KEYS.speciesSpellAbility]: [ability] } })}
              />
            ))}
          </ChipRow>
        </Section>
      ) : null}

      <ClassOptionsPicker
        character={character}
        onChoice={(key, ids) => set({ choices: { ...character.choices, [key]: ids } })}
      />

      <Section title={t('edit.notes')}>{field('notes', t('edit.notesPlaceholder'), true)}</Section>

      <Section title={t('edit.file')} hint={t('edit.fileHint')}>
        <SmallButton
          title={sharing ? t('edit.saving') : t('edit.saveToFile')}
          disabled={sharing}
          onPress={exportToFile}
        />
      </Section>
    </Screen>
  );
}

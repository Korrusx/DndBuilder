import { useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

import { usePlay } from '@/entities/character/model/CharacterContext';
import type { Character } from '@/entities/character/model/types';
import { shareCharacters } from '@/features/transfer-characters/api/files';
import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { content, tr } from '@/shared/content/content';
import { nameOf } from '@/shared/content/names';
import { Chip } from '@/shared/ui/Chip/Chip';
import { ChipRow } from '@/shared/ui/ChipRow/ChipRow';
import { Screen } from '@/shared/ui/Screen/Screen';
import { Section } from '@/shared/ui/Section/Section';
import { SmallButton } from '@/shared/ui/SmallButton/SmallButton';

type TextField = 'name' | 'player' | 'campaign' | 'notes';

/** Изменение данных персонажа, которые меняются по ходу игры: имя, кампания, мировоззрение, языки, заметки. */
export function PlayEditPage() {
  const { character: c, update } = usePlay();
  const set = (patch: Partial<Character>) => update((d) => ({ ...d, ...patch }));
  const [sharing, setSharing] = useState(false);
  const exportToFile = async () => {
    setSharing(true);
    try {
      await shareCharacters([c]);
    } catch (err) {
      Alert.alert('Не удалось сохранить файл', err instanceof Error ? err.message : String(err));
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

  const toggleLanguage = (id: string) =>
    set({ languages: c.languages.includes(id) ? c.languages.filter((l) => l !== id) : [...c.languages, id] });

  return (
    <Screen>
      <Section title="Имя">{field('name', 'Имя персонажа')}</Section>
      <Section title="Игрок">{field('player', 'Кто играет этим персонажем')}</Section>
      <Section title="Кампания">{field('campaign', 'Название кампании')}</Section>

      <Section title="Мировоззрение">
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

      <Section title="Языки" hint="Отметьте языки, которые персонаж выучил по ходу игры.">
        <ChipRow>
          {content.languages.map((l) => (
            <Chip key={l.id} label={nameOf('languages', l.id)} selected={c.languages.includes(l.id)} onPress={() => toggleLanguage(l.id)} />
          ))}
        </ChipRow>
      </Section>

      <Section title="Заметки">{field('notes', 'Внешность, характер, союзники, задания…', true)}</Section>

      <Section title="Файл" hint="Файл .dnd.json можно отправить другу или сохранить как копию; открывается кнопкой «Импорт» на экране «Мои персонажи».">
        <SmallButton title={sharing ? 'Сохраняем…' : 'Сохранить персонажа в файл'} disabled={sharing} onPress={exportToFile} />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  multiline: { minHeight: 140, textAlignVertical: 'top', borderRadius: radius.card - 4 },
});

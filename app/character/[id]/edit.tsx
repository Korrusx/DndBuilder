import { useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

import { usePlay } from '@/components/play/CharacterContext';
import { SmallButton } from '@/components/play/ui';
import { shareCharacters } from '@/db/exchangeFiles';
import { Screen } from '@/components/Screen';
import { nameOf } from '@/components/wizard/names';
import { Chip, ChipRow, Section } from '@/components/wizard/ui';
import { content, tr } from '@/content';
import type { Character } from '@/rules/character';
import { colors, fonts, radius, sizes, spacing } from '@/theme';

type TextField = 'name' | 'player' | 'campaign' | 'notes';

/** Изменение данных персонажа, которые меняются по ходу игры: имя, кампания, мировоззрение, языки, заметки. */
export default function EditCharacterScreen() {
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

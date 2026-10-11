import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CharacterCard } from '@/components/CharacterCard';
import { CREATE_STEPS } from '@/components/wizard/steps';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';
import { content } from '@/content';
import { deleteCharacters, newId, saveCharacter } from '@/db/characters';
import { useCharacterList } from '@/db/hooks';
import type { Character } from '@/rules/character';
import { irmaLevel1 } from '@/rules/samples';
import { computeSheet } from '@/rules/sheet';
import { colors, spacing } from '@/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CharactersScreen() {
  const { db, characters, lastBackupAt, reload } = useCharacterList();

  const open = (c: Character) => {
    if (c.status.kind === 'draft') {
      const step = CREATE_STEPS[Math.min(c.status.step, CREATE_STEPS.length) - 1];
      router.push({ pathname: step.route, params: { id: c.id } });
    } else {
      router.push({ pathname: '/character/[id]', params: { id: c.id } });
    }
  };

  // Режим выбора для массового удаления: null — выключен.
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: selected ? `Выбрано: ${selected.size}` : 'Мои персонажи' });
  }, [navigation, selected]);

  // Кнопка «Назад» на Android выходит из режима выбора, а не из приложения.
  useFocusEffect(
    useCallback(() => {
      if (!selected) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setSelected(null);
        return true;
      });
      return () => sub.remove();
    }, [selected]),
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next.size ? next : null;
    });

  const confirmDelete = () => {
    if (!selected?.size) return;
    const names = (characters ?? []).filter((c) => selected.has(c.id)).map((c) => `«${c.name || 'Без имени'}»`);
    const shown = names.length > 5 ? [...names.slice(0, 5), `и ещё ${names.length - 5}`] : names;
    Alert.alert(
      names.length === 1 ? 'Удалить персонажа?' : `Удалить персонажей: ${names.length}?`,
      `${shown.join(', ')} — восстановить будет нельзя.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteCharacters(db, [...selected]);
            setSelected(null);
            reload();
          },
        },
      ],
    );
  };

  // Только для проверки в режиме разработки, пока нет мастера создания (этап 5).
  const addSamples = async () => {
    const now = new Date().toISOString();
    const irma = { ...irmaLevel1(), id: newId(), campaign: 'Пробная кампания', createdAt: now };
    irma.state = { ...irma.state, currentHp: computeSheet(irma, content).maxHp - 3 };
    await saveCharacter(db, irma);
    await saveCharacter(db, {
      ...irmaLevel1(),
      id: newId(),
      name: 'Безымянный',
      status: { kind: 'draft', step: 3 },
      createdAt: now,
    });
    reload();
  };

  const ready = characters?.filter((c) => c.status.kind === 'ready') ?? [];
  const drafts = characters?.filter((c) => c.status.kind === 'draft') ?? [];

  const allSelected = !!selected && !!characters && selected.size === characters.length;
  const card = (c: Character) => (
    <CharacterCard
      key={c.id}
      character={c}
      selected={selected ? selected.has(c.id) : undefined}
      onPress={() => (selected ? toggle(c.id) : open(c))}
      onLongPress={() => toggle(c.id)}
    />
  );

  return (
    <Screen
      footer={
        selected ? (
          <>
            <Button title={`Удалить (${selected.size})`} variant="danger" onPress={confirmDelete} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Button
                  title={allSelected ? 'Снять все' : 'Выбрать все'}
                  variant="secondary"
                  onPress={() => setSelected(allSelected ? null : new Set((characters ?? []).map((c) => c.id)))}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Отмена" variant="secondary" onPress={() => setSelected(null)} />
              </View>
            </View>
          </>
        ) : (
          <>
            <Button title="Новый персонаж" onPress={() => router.push('/create/class')} />
            <Button
              title="Импорт"
              variant="secondary"
              onPress={() => Alert.alert('Импорт', 'Импорт персонажа из файла появится на этапе 7.')}
            />
          </>
        )
      }
    >
      {characters === null ? (
        <ActivityIndicator color={colors.accent} />
      ) : characters.length === 0 ? (
        <Placeholder title="Пока пусто" note="Создайте первого персонажа кнопкой «Новый персонаж»." />
      ) : null}

      {ready.map(card)}

      {drafts.length > 0 ? <AppText variant="heading">Черновики</AppText> : null}
      {drafts.map(card)}

      {characters && characters.length > 0 ? (
        <AppText variant="secondary" style={{ textAlign: 'center' }}>
          {selected ? 'Нажимайте на карточки, чтобы отметить их' : 'Удерживайте карточку, чтобы выбрать персонажей для удаления'}
        </AppText>
      ) : null}

      {__DEV__ ? <Button title="Добавить примеры (для проверки)" variant="secondary" onPress={addSamples} /> : null}
      <Button title="О приложении и лицензии" variant="secondary" onPress={() => router.push('/about')} />
      <AppText variant="secondary" style={{ textAlign: 'center' }}>
        Работает без интернета ·{' '}
        {lastBackupAt ? `последняя копия ${formatDate(lastBackupAt)}` : 'резервных копий ещё не было'}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
});

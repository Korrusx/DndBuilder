import { router } from 'expo-router';
import { ActivityIndicator, Alert } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CharacterCard } from '@/components/CharacterCard';
import { CREATE_STEPS } from '@/components/CreateStep';
import { Placeholder } from '@/components/Placeholder';
import { Screen } from '@/components/Screen';
import { content } from '@/content';
import { deleteCharacter, newId, saveCharacter } from '@/db/characters';
import { useCharacterList } from '@/db/hooks';
import type { Character } from '@/rules/character';
import { irmaLevel1 } from '@/rules/samples';
import { computeSheet } from '@/rules/sheet';
import { colors } from '@/theme';

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

  const confirmDelete = (c: Character) => {
    Alert.alert('Удалить персонажа?', `«${c.name || 'Без имени'}» будет удалён без возможности восстановления.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteCharacter(db, c.id);
          reload();
        },
      },
    ]);
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

  return (
    <Screen
      footer={
        <>
          <Button title="Новый персонаж" onPress={() => router.push('/create/class')} />
          <Button
            title="Импорт"
            variant="secondary"
            onPress={() => Alert.alert('Импорт', 'Импорт персонажа из файла появится на этапе 7.')}
          />
        </>
      }
    >
      {characters === null ? (
        <ActivityIndicator color={colors.accent} />
      ) : characters.length === 0 ? (
        <Placeholder title="Пока пусто" note="Создайте первого персонажа кнопкой «Новый персонаж»." />
      ) : null}

      {ready.map((c) => (
        <CharacterCard key={c.id} character={c} onPress={() => open(c)} onLongPress={() => confirmDelete(c)} />
      ))}

      {drafts.length > 0 ? <AppText variant="heading">Черновики</AppText> : null}
      {drafts.map((c) => (
        <CharacterCard key={c.id} character={c} onPress={() => open(c)} onLongPress={() => confirmDelete(c)} />
      ))}

      {characters && characters.length > 0 ? (
        <AppText variant="secondary" style={{ textAlign: 'center' }}>
          Удерживайте карточку, чтобы удалить персонажа
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

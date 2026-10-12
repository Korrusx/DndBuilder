import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, View } from 'react-native';

import type { Character } from '@/entities/character';
import { computeSheet, irmaLevel1 } from '@/entities/character';
import { deleteCharacters, newId, saveCharacter, saveCharacters, useCharacterList } from '@/entities/character/api';
import { CharacterCard } from '@/entities/character/ui';
import { CREATE_STEPS } from '@/features/create-character';
import { ImportError, pickCharactersFile, shareCharacters } from '@/features/transfer-characters';
import { colors } from '@/shared/config';
import { content } from '@/shared/content';
import { setMeta } from '@/shared/db';
import { useTranslation } from '@/shared/i18n';
import { formatDate } from '@/shared/lib/date';
import { AppText, Button, Placeholder, Screen } from '@/shared/ui';

import { styles } from './CharactersPage.styles';

export function CharactersPage() {
  const { db, characters, lastBackupAt, reload } = useCharacterList();
  const { t } = useTranslation();

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
    navigation.setOptions({ title: selected ? t('characters.selected', { count: selected.size }) : t('nav.characters') });
  }, [navigation, selected, t]);

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
    const names = (characters ?? []).filter((c) => selected.has(c.id)).map((c) => `«${c.name || t('common.unnamed')}»`);
    const shown = names.length > 5 ? [...names.slice(0, 5), t('common.andMore', { count: names.length - 5 })] : names;
    Alert.alert(
      names.length === 1 ? t('characters.deleteOne') : t('characters.deleteMany', { count: names.length }),
      t('characters.deleteWarning', { names: shown.join(', ') }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
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

  const [busy, setBusy] = useState(false);
  const withBusy = async (task: () => Promise<void>, errorTitle: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await task();
    } catch (err) {
      Alert.alert(errorTitle, err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  /** Сохранить персонажей в файл и поделиться. Копия всех персонажей отмечается как резервная копия. */
  const exportCharacters = (list: Character[], isBackup: boolean) =>
    withBusy(async () => {
      await shareCharacters(list);
      if (isBackup) {
        await setMeta(db, 'lastBackupAt', new Date().toISOString());
        reload();
      }
    }, t('characters.saveFailed'));

  const importCharacters = () =>
    withBusy(async () => {
      let result;
      try {
        result = await pickCharactersFile();
      } catch (err) {
        if (err instanceof ImportError) {
          Alert.alert(t('characters.loadFailed'), err.message);
          return;
        }
        throw err;
      }
      if (!result) return;
      await saveCharacters(db, result.characters);
      reload();
      const names = result.characters.map((c) => `«${c.name || t('common.unnamed')}»`).join(', ');
      const title = result.characters.length === 1 ? t('characters.loadedOne') : t('characters.loadedMany', { count: result.characters.length });
      Alert.alert(title, [names, ...result.warnings].join('\n\n'));
    }, t('characters.loadFailed'));

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
      draftSteps={CREATE_STEPS.length}
    />
  );

  return (
    <Screen
      footer={
        selected ? (
          <>
            <View style={styles.row}>
              <View style={styles.fill}>
                <Button
                  title={t('characters.toFile', { count: selected.size })}
                  variant="secondary"
                  disabled={busy}
                  onPress={() => exportCharacters((characters ?? []).filter((c) => selected.has(c.id)), allSelected)}
                />
              </View>
              <View style={styles.fill}>
                <Button title={t('characters.deleteCount', { count: selected.size })} variant="danger" onPress={confirmDelete} />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.fill}>
                <Button
                  title={allSelected ? t('characters.selectNone') : t('characters.selectAll')}
                  variant="secondary"
                  onPress={() => setSelected(allSelected ? null : new Set((characters ?? []).map((c) => c.id)))}
                />
              </View>
              <View style={styles.fill}>
                <Button title={t('common.cancel')} variant="secondary" onPress={() => setSelected(null)} />
              </View>
            </View>
          </>
        ) : (
          <>
            <Button title={t('characters.new')} onPress={() => router.push('/create/class')} />
            <View style={styles.row}>
              <View style={styles.fill}>
                <Button title={t('characters.import')} variant="secondary" disabled={busy} onPress={importCharacters} />
              </View>
              <View style={styles.fill}>
                <Button
                  title={t('characters.backupAll')}
                  variant="secondary"
                  disabled={busy || !characters?.length}
                  onPress={() => exportCharacters(characters ?? [], true)}
                />
              </View>
            </View>
          </>
        )
      }
    >
      {characters === null ? (
        <ActivityIndicator color={colors.accent} />
      ) : characters.length === 0 ? (
        <Placeholder title={t('characters.empty')} note={t('characters.emptyHint')} />
      ) : null}

      {ready.map(card)}

      {drafts.length > 0 ? <AppText variant="heading">{t('characters.drafts')}</AppText> : null}
      {drafts.map(card)}

      {characters && characters.length > 0 ? (
        <AppText variant="secondary" style={styles.centered}>
          {selected ? t('characters.selectHint') : t('characters.holdHint')}
        </AppText>
      ) : null}

      {__DEV__ ? <Button title={t('characters.addSamples')} variant="secondary" onPress={addSamples} /> : null}
      <Button title={t('characters.about')} variant="secondary" onPress={() => router.push('/about')} />
      <AppText variant="secondary" style={styles.centered}>
        {t('characters.offline')} ·{' '}
        {lastBackupAt ? t('characters.lastBackup', { date: formatDate(lastBackupAt) }) : t('characters.noBackup')}
      </AppText>
    </Screen>
  );
}

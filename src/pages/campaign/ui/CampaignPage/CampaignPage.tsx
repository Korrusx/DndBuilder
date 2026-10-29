import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Entry, Session, TimelineItem } from '@/entities/campaign';
import {
  activeSessionOf,
  hallOfHeroes,
  isForgottenSession,
  lastEndedSession,
  nextSessionNumber,
  timelineGroups,
} from '@/entities/campaign';
import { loadPhotos, saveCampaign, saveParticipant, useCampaign } from '@/entities/campaign/api';
import type { Character } from '@/entities/character';
import { listCharacters } from '@/entities/character/api';
import { shareChronicle } from '@/features/transfer-characters';
import { QuestBoard } from '@/widgets/quest-board';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText, Button, Screen, UndoBar } from '@/shared/ui';

import { UNDO_MS } from '../../config/constants';
import { createQuest, endSession, forgetPhotos, removeEntries, restoreEntries, startSession } from '../../lib/actions';
import type { CampaignTab } from '../../model/types';
import { CampaignEditSheet } from '../CampaignEditSheet/CampaignEditSheet';
import { CampaignHeader } from '../CampaignHeader/CampaignHeader';
import { CampaignTabs } from '../CampaignTabs/CampaignTabs';
import { EndSessionSheet } from '../EndSessionSheet/EndSessionSheet';
import { EntityListTab } from '../EntityListTab/EntityListTab';
import { HallSheet } from '../HallSheet/HallSheet';
import { HeroChips } from '../HeroChips/HeroChips';
import type { Hero } from '../HeroChips/HeroChips.types';
import { HeroSheet } from '../HeroSheet/HeroSheet';
import { RecapButton } from '../RecapButton/RecapButton';
import { SearchResults } from '../SearchResults/SearchResults';
import { TimelineBlock } from '../TimelineBlock/TimelineBlock';
import { styles } from './CampaignPage.styles';

/** Хроника кампании (Х1): герои, сессии и летопись, люди, места, квесты. */
export function CampaignPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { db, data, reload } = useCampaign(id);
  const [characters, setCharacters] = useState<Map<string, Character>>(new Map());
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<CampaignTab>('chronicle');
  const [query, setQuery] = useState<string | null>(null);
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [undo, setUndo] = useState<Entry[] | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ending, setEnding] = useState<Session | null>(null);
  const [heroOpen, setHeroOpen] = useState<Hero | null>(null);
  const [hallOpen, setHallOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const askedForgotten = useRef(false);

  useFocusEffect(
    useCallback(() => {
      listCharacters(db)
        .then((list) => setCharacters(new Map(list.map((character) => [character.id, character]))))
        .catch(() => undefined);
    }, [db]),
  );

  // Фото заметок и портреты карточек (для списков «Люди» и «Места»).
  const photoIds = useMemo(
    () => [
      ...(data?.entries.flatMap((entry) => entry.photoIds) ?? []),
      ...(data?.entities.flatMap((entity) => (entity.portraitPhotoId ? [entity.portraitPhotoId] : [])) ?? []),
    ],
    [data],
  );
  useEffect(() => {
    loadPhotos(db, photoIds)
      .then(setPhotos)
      .catch(() => undefined);
  }, [db, photoIds]);

  const active = data ? activeSessionOf(data.sessions) : null;

  // Сессия идёт больше 12 часов без событий — наверное, её забыли завершить.
  useEffect(() => {
    if (!data || !active || askedForgotten.current) {
      return;
    }
    askedForgotten.current = true;
    if (isForgottenSession(active, data.entries, new Date().toISOString())) {
      Alert.alert(t('chronicle.session.forgottenTitle', { number: active.number }), t('chronicle.session.forgotten'), [
        { text: t('chronicle.session.keep'), style: 'cancel' },
        { text: t('chronicle.session.end'), onPress: () => setEnding(active) },
      ]);
    }
  }, [data, active, t]);

  useEffect(
    () => () => {
      if (undoTimer.current) {
        clearTimeout(undoTimer.current);
      }
    },
    [],
  );

  const entitiesById = useMemo(() => new Map((data?.entities ?? []).map((entity) => [entity.id, entity])), [data]);

  if (data === undefined) {
    return null;
  }
  if (data === null) {
    return (
      <Screen>
        <AppText variant="heading">{t('chronicle.notFound')}</AppText>
      </Screen>
    );
  }

  const heroes: Hero[] = data.participants
    .filter((participant) => participant.status === 'active')
    .flatMap((participant) => {
      const character = characters.get(participant.characterId);
      return character ? [{ participant, character }] : [];
    });
  const hall: Hero[] = hallOfHeroes(data.participants).flatMap((participant) => {
    const character = characters.get(participant.characterId);
    return character ? [{ participant, character }] : [];
  });
  const groups = timelineGroups(data.sessions, data.entries);
  const lastEnded = lastEndedSession(data.sessions);
  const isExpanded = (key: string, index: number) => toggled[key] ?? (active ? key === active.id : index === 0);
  const subtitle = [
    t('chronicle.sessionsCount', { count: data.sessions.length }),
    data.campaign.gmName ? t('chronicle.gm', { name: data.campaign.gmName }) : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const counts = {
    people: data.entities.filter((entity) => entity.type === 'person' || entity.type === 'faction').length,
    places: data.entities.filter((entity) => entity.type === 'place').length,
    quests: data.entities.filter((entity) => entity.type === 'quest' && (entity.status ?? 'active') === 'active')
      .length,
  };

  const finishUndo = (entries: Entry[] | null) => {
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
    if (entries) {
      forgetPhotos(db, entries).catch(() => undefined);
    }
    setUndo(null);
  };

  const deleteWithUndo = async (entries: Entry[]) => {
    finishUndo(undo);
    await removeEntries(db, entries);
    await reload();
    setUndo(entries);
    undoTimer.current = setTimeout(() => finishUndo(entries), UNDO_MS);
  };

  const restore = async () => {
    const entries = undo;
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
    setUndo(null);
    if (entries) {
      await restoreEntries(db, entries);
      await reload();
    }
  };

  const openEntity = (entityId: string, edit = false) =>
    router.push({
      pathname: '/campaign/[id]/entity/[entityId]',
      params: edit ? { id, entityId, edit: '1' } : { id, entityId },
    });

  const openEntry = (entryId?: string) =>
    router.push({ pathname: '/campaign/[id]/entry', params: entryId ? { id, entryId } : { id } });

  const noteActions = (entry: Entry) =>
    Alert.alert(t('chronicle.note.title'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteWithUndo([entry]) },
      { text: t('common.change'), onPress: () => openEntry(entry.id) },
    ]);

  const run = (task: () => Promise<unknown>) =>
    task()
      .then(reload)
      .catch((error) => Alert.alert(t('chronicle.failed'), error instanceof Error ? error.message : String(error)));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <CampaignHeader
        title={data.campaign.name}
        subtitle={subtitle}
        onTitlePress={() => setEditOpen(true)}
        query={query}
        onQueryChange={setQuery}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {query !== null ? (
          <SearchResults
            query={query}
            entries={data.entries}
            sessions={data.sessions}
            entitiesById={entitiesById}
            onMentionPress={openEntity}
          />
        ) : (
          <>
            <HeroChips heroes={heroes} hallCount={hall.length} onHero={setHeroOpen} onHall={() => setHallOpen(true)} />
            {lastEnded ? (
              <RecapButton
                sessionNumber={lastEnded.number}
                onPress={() =>
                  router.push({ pathname: '/campaign/[id]/recap', params: { id, sessionId: lastEnded.id } })
                }
              />
            ) : null}
            {active ? null : (
              <Button
                title={t('chronicle.session.start', { number: nextSessionNumber(data.sessions) })}
                variant="secondary"
                onPress={() => run(() => startSession(db, data, characters))}
              />
            )}
            <CampaignTabs value={tab} onChange={setTab} counts={counts} />
            {tab === 'chronicle' ? (
              groups.length ? (
                groups.map((group, index) => (
                  <TimelineBlock
                    key={group.key}
                    group={group}
                    expanded={isExpanded(group.key, index)}
                    onToggle={() => setToggled((s) => ({ ...s, [group.key]: !isExpanded(group.key, index) }))}
                    entitiesById={entitiesById}
                    photos={photos}
                    onEndSession={
                      group.kind === 'session' && group.session.id === active?.id
                        ? () => setEnding(group.session)
                        : undefined
                    }
                    onEditStop={group.kind === 'session' ? () => setEnding(group.session) : undefined}
                    onDeleteEvent={(item: Extract<TimelineItem, { kind: 'event' }>) => deleteWithUndo(item.entries)}
                    onNoteLongPress={noteActions}
                    onMentionPress={openEntity}
                  />
                ))
              ) : (
                <AppText variant="secondary">{t('chronicle.emptyChronicle')}</AppText>
              )
            ) : tab === 'quests' ? (
              <QuestBoard
                data={data}
                heroes={heroes.map((hero) => hero.character)}
                onOpenEntity={openEntity}
                onCreate={() =>
                  createQuest(db, data.campaign.id, t('chronicle.quest.newName'))
                    .then((quest) => openEntity(quest.id, true))
                    .catch(() => undefined)
                }
                onChanged={() => reload().catch(() => undefined)}
              />
            ) : (
              <EntityListTab tab={tab} entities={data.entities} photos={photos} onOpen={openEntity} />
            )}
          </>
        )}
      </ScrollView>

      {tab === 'chronicle' && query === null && !undo ? (
        <Pressable accessibilityRole="button" onPress={() => openEntry()} style={styles.fab}>
          <MaterialCommunityIcons name="plus" size={22} color={colors.onAccent} />
          <AppText style={styles.fabText}>{t('chronicle.note.add')}</AppText>
        </Pressable>
      ) : null}
      <UndoBar
        message={undo ? t('chronicle.deleted', { count: undo.length }) : null}
        actionLabel={t('chronicle.undo')}
        onAction={restore}
      />

      <EndSessionSheet
        session={ending}
        onClose={() => setEnding(null)}
        onEnd={(whereWeStopped) => {
          const session = ending;
          setEnding(null);
          if (session) {
            run(() => endSession(db, session, whereWeStopped));
          }
        }}
      />
      <HeroSheet
        hero={heroOpen}
        onClose={() => setHeroOpen(null)}
        onOpenSheet={(hero) => {
          setHeroOpen(null);
          router.push({ pathname: '/character/[id]', params: { id: hero.character.id } });
        }}
        onToHall={(hero, status, epitaph) =>
          Alert.alert(
            t('chronicle.hero.toHallConfirmTitle', { name: hero.character.name }),
            t('chronicle.hero.toHallConfirm'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('chronicle.hero.toHall'),
                style: 'destructive',
                onPress: () => {
                  setHeroOpen(null);
                  run(() =>
                    saveParticipant(db, {
                      ...hero.participant,
                      status,
                      epitaph: epitaph.trim() || undefined,
                      leftAt: new Date().toISOString(),
                    }),
                  );
                },
              },
            ],
          )
        }
      />
      <HallSheet
        visible={hallOpen}
        heroes={hall}
        onClose={() => setHallOpen(false)}
        onRestore={(hero) => {
          setHallOpen(false);
          run(() =>
            saveParticipant(db, { ...hero.participant, status: 'active', leftAt: undefined, epitaph: undefined }),
          );
        }}
      />
      <CampaignEditSheet
        campaign={data.campaign}
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        onExport={() => {
          setEditOpen(false);
          shareChronicle(db, data.campaign.id).catch((error) =>
            Alert.alert(t('chronicle.files.exportFailed'), error instanceof Error ? error.message : String(error)),
          );
        }}
        onSave={(name, gmName) => {
          setEditOpen(false);
          run(() =>
            saveCampaign(db, {
              ...data.campaign,
              name: name.trim().replace(/\s+/g, ' '),
              gmName: gmName.trim() || undefined,
            }),
          );
        }}
      />
    </SafeAreaView>
  );
}

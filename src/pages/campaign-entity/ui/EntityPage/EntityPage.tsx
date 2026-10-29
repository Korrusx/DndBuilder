import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Entity, PersonStatus, QuestStatus } from '@/entities/campaign';
import { firstSeenSession, mentionsOf } from '@/entities/campaign';
import {
  deleteEntity,
  deleteEntityLink,
  deletePhotos,
  loadPhotos,
  recordEvent,
  saveEntity,
  saveEntityLink,
  savePhoto,
  useCampaign,
} from '@/entities/campaign/api';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { newId } from '@/shared/lib/id';
import { pickPhoto } from '@/shared/lib/photo';
import { AppText, Screen } from '@/shared/ui';

import { PERSON_STATUSES } from '../../config/constants';
import { AttitudeScale } from '../AttitudeScale/AttitudeScale';
import { EditEntitySheet } from '../EditEntitySheet/EditEntitySheet';
import { EntityPickerSheet } from '../EntityPickerSheet/EntityPickerSheet';
import { LinksSection } from '../LinksSection/LinksSection';
import { MentionsSection } from '../MentionsSection/MentionsSection';
import { QuestEditor } from '../QuestEditor/QuestEditor';
import { styles } from './EntityPage.styles';

type Picker = 'place' | 'giver' | 'link' | null;

/** Карточка человека, места, фракции или квеста (Х3): портрет, отношение, связи, упоминания. */
export function EntityPage() {
  const { id, entityId, edit } = useLocalSearchParams<{ id: string; entityId: string; edit?: string }>();
  const { t } = useTranslation();
  const { db, data, reload } = useCampaign(id);
  const [portraits, setPortraits] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(edit === '1');
  const [picker, setPicker] = useState<Picker>(null);
  const entity = data?.entities.find((item) => item.id === entityId);
  const portraitId = entity?.portraitPhotoId;
  const portrait = portraitId ? (portraits[portraitId] ?? null) : null;

  useEffect(() => {
    if (portraitId) {
      loadPhotos(db, [portraitId])
        .then((photos) => setPortraits((loaded) => ({ ...loaded, ...photos })))
        .catch(() => undefined);
    }
  }, [db, portraitId]);

  if (data === undefined) {
    return null;
  }
  if (!data || !entity) {
    return (
      <Screen>
        <AppText variant="heading">{t('chronicle.card.notFound')}</AppText>
      </Screen>
    );
  }

  const entitiesById = new Map(data.entities.map((item) => [item.id, item]));
  const open = (otherId: string) =>
    router.push({ pathname: '/campaign/[id]/entity/[entityId]', params: { id, entityId: otherId } });
  const patch = (changes: Partial<Entity>) =>
    saveEntity(db, { ...entity, ...changes })
      .then(reload)
      .catch(() => undefined);

  const setQuestStatus = async (status: QuestStatus) => {
    if (status === ((entity.status as QuestStatus | undefined) ?? 'active')) {
      return;
    }
    await saveEntity(db, { ...entity, status });
    await recordEvent(db, { type: 'quest', questId: entity.id, name: entity.name, change: status }, { campaignId: id });
    await reload();
  };

  const changePortrait = async () => {
    const base64 = await pickPhoto({ square: true });
    if (!base64) {
      return;
    }
    const photoId = await savePhoto(db, base64);
    await saveEntity(db, { ...entity, portraitPhotoId: photoId });
    if (entity.portraitPhotoId) {
      await deletePhotos(db, [entity.portraitPhotoId]);
    }
    await reload();
  };

  const remove = () =>
    Alert.alert(t('chronicle.card.deleteTitle', { name: entity.name }), t('chronicle.card.deleteHint'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          setEditing(false);
          await deleteEntity(db, entity.id);
          if (entity.portraitPhotoId) {
            await deletePhotos(db, [entity.portraitPhotoId]);
          }
          router.back();
        },
      },
    ]);

  const isQuest = entity.type === 'quest';
  const hasAttitude = entity.type === 'person' || entity.type === 'faction';
  const place = entity.placeId ? entitiesById.get(entity.placeId) : undefined;
  const firstSeen = firstSeenSession(entity.id, data.entries, data.sessions);
  const links = data.links.filter((link) => link.fromId === entity.id || link.toId === entity.id);
  const status = entity.status as PersonStatus | undefined;
  const others = data.entities.filter((item) => item.id !== entity.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('tabs.back')}
          onPress={() => router.back()}
          style={styles.icon}
        >
          <MaterialCommunityIcons name="chevron-left" size={30} color={colors.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.change')}
          onPress={() => setEditing(true)}
          style={styles.icon}
        >
          <MaterialCommunityIcons name="pencil-outline" size={22} color={colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          {isQuest ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('chronicle.card.portrait')}
              onPress={() => changePortrait().catch(() => undefined)}
              style={styles.portraitWrap}
            >
              <View style={styles.portrait}>
                {portrait ? (
                  <Image source={{ uri: portrait }} style={styles.portraitImage} />
                ) : (
                  <AppText style={styles.letter}>{entity.name.charAt(0).toLocaleUpperCase()}</AppText>
                )}
              </View>
              <View style={styles.plus}>
                <MaterialCommunityIcons name="plus" size={18} color={colors.textSecondary} />
              </View>
            </Pressable>
          )}
          <View style={styles.info}>
            <AppText style={styles.name}>{entity.name}</AppText>
            {entity.role ? <AppText style={styles.role}>{entity.role}</AppText> : null}
            {entity.description ? <AppText style={styles.description}>{entity.description}</AppText> : null}
          </View>
        </View>

        <View style={styles.chips}>
          {entity.type === 'person' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                patch({
                  status: PERSON_STATUSES[(PERSON_STATUSES.indexOf(status ?? 'alive') + 1) % PERSON_STATUSES.length],
                })
              }
              style={[
                styles.chip,
                status !== 'dead' && status !== 'unknown' && styles.alive,
                status === 'dead' && styles.dead,
              ]}
            >
              <AppText
                style={[
                  styles.chipText,
                  status !== 'dead' && status !== 'unknown' && styles.aliveText,
                  status === 'dead' && styles.deadText,
                ]}
              >
                {t(`chronicle.personStatus.${status ?? 'alive'}`)}
              </AppText>
            </Pressable>
          ) : null}
          {entity.type === 'person' ? (
            <Pressable accessibilityRole="button" onPress={() => setPicker('place')} style={styles.chip}>
              <AppText style={styles.chipText}>{place ? place.name : t('chronicle.card.pickPlace')}</AppText>
            </Pressable>
          ) : null}
          {firstSeen ? (
            <View style={styles.chip}>
              <AppText style={styles.chipText}>{t('chronicle.card.firstSeen', { number: firstSeen.number })}</AppText>
            </View>
          ) : null}
        </View>

        {hasAttitude ? <AttitudeScale value={entity.attitude} onChange={(attitude) => patch({ attitude })} /> : null}

        {isQuest ? (
          <QuestEditor
            quest={entity}
            steps={data.steps.filter((step) => step.questId === entity.id).sort((a, b) => a.order - b.order)}
            counter={data.counters.find((counter) => counter.questId === entity.id) ?? null}
            entitiesById={entitiesById}
            onPatch={patch}
            onStatus={(next) => setQuestStatus(next).catch(() => undefined)}
            onPickGiver={() => setPicker('giver')}
            onOpen={open}
            onChanged={() => reload().catch(() => undefined)}
          />
        ) : null}

        <LinksSection
          entity={entity}
          links={links}
          entitiesById={entitiesById}
          onOpen={open}
          onAdd={() => setPicker('link')}
          onDelete={(link) =>
            deleteEntityLink(db, link.id)
              .then(reload)
              .catch(() => undefined)
          }
        />

        <MentionsSection hits={mentionsOf(entity.id, data.entries, entitiesById)} sessions={data.sessions} />
      </ScrollView>

      <EditEntitySheet
        entity={entity}
        visible={editing}
        onClose={() => setEditing(false)}
        onSave={(changes) => {
          setEditing(false);
          patch(changes);
        }}
        onDelete={remove}
      />
      <EntityPickerSheet
        visible={picker !== null}
        title={t(`chronicle.card.pickTitle.${picker ?? 'link'}`)}
        entities={
          picker === 'place'
            ? others.filter((item) => item.type === 'place')
            : picker === 'giver'
              ? others.filter((item) => item.type === 'person' || item.type === 'faction')
              : others
        }
        onClose={() => setPicker(null)}
        onPick={(picked) => {
          setPicker(null);
          patch(picker === 'place' ? { placeId: picked.id } : { givenById: picked.id });
        }}
        labelPlaceholder={t('chronicle.card.linkLabel')}
        onPickWithLabel={
          picker === 'link'
            ? (picked, label) => {
                setPicker(null);
                saveEntityLink(db, { id: newId(), fromId: entity.id, toId: picked.id, label, updatedAt: '' })
                  .then(reload)
                  .catch(() => undefined);
              }
            : undefined
        }
        onClear={
          picker === 'place' && entity.placeId
            ? () => {
                setPicker(null);
                patch({ placeId: undefined });
              }
            : picker === 'giver' && entity.givenById
              ? () => {
                  setPicker(null);
                  patch({ givenById: undefined });
                }
              : undefined
        }
      />
    </SafeAreaView>
  );
}

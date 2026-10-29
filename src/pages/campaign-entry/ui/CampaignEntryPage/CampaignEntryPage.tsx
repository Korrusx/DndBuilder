import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CampaignData, Entity, EntityType, Entry, EntryTag, MentionDoc } from '@/entities/campaign';
import {
  activeSessionOf,
  ENTRY_TAGS,
  findMentionQuery,
  fromMentionDoc,
  insertMention,
  applyTextChange,
  toMentionDoc,
} from '@/entities/campaign';
import { deletePhotos, loadCampaign, loadPhotos, saveEntity, saveEntry, savePhoto } from '@/entities/campaign/api';
import { recordEvent } from '@/features/chronicle-journal';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { formatTime } from '@/shared/lib/date';
import { newId } from '@/shared/lib/id';
import { pickPhoto } from '@/shared/lib/photo';
import { AppText, Chip, ChipRow, PhotoViewer } from '@/shared/ui';

import { DRAFT_SAVE_MS } from '../../config/constants';
import { clearDraft, entityNameFromQuery, loadDraft, saveDraft, withAt } from '../../lib/draft';
import { EntryToolbar } from '../EntryToolbar/EntryToolbar';
import { MentionInput } from '../MentionInput/MentionInput';
import { MentionSuggestions } from '../MentionSuggestions/MentionSuggestions';
import { styles } from './CampaignEntryPage.styles';

const EMPTY_DOC: MentionDoc = { text: '', mentions: [] };

/** Новая запись или правка заметки (Х2): метки, текст с @упоминаниями, фото, тайная запись, черновик. */
export function CampaignEntryPage() {
  const { id, entryId } = useLocalSearchParams<{ id: string; entryId?: string }>();
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const [data, setData] = useState<CampaignData | null | undefined>(undefined);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [original, setOriginal] = useState<Entry | null>(null);
  const [doc, setDoc] = useState<MentionDoc>(EMPTY_DOC);
  const [tags, setTags] = useState<EntryTag[]>([]);
  const [secret, setSecret] = useState(false);
  const [photoIds, setPhotoIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [cursor, setCursor] = useState(0);
  const [forcedCursor, setForcedCursor] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('');
  const [startedAt] = useState(() => new Date().toISOString());
  const [openedPhoto, setOpenedPhoto] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const loaded = await loadCampaign(db, id);
      const entry = entryId ? (loaded?.entries.find((item) => item.id === entryId) ?? null) : null;
      const draft = await loadDraft(db);
      const fromDraft = draft && draft.campaignId === id && draft.entryId === (entryId ?? null) ? draft : null;
      const byId = new Map((loaded?.entities ?? []).map((entity) => [entity.id, entity]));
      const ids = fromDraft?.photoIds ?? entry?.photoIds ?? [];
      setData(loaded);
      setEntities(loaded?.entities ?? []);
      setOriginal(entry);
      setDoc(toMentionDoc(fromDraft?.text ?? entry?.text ?? '', byId));
      setTags(fromDraft?.tags ?? entry?.tags ?? []);
      setSecret(fromDraft?.secret ?? entry?.secret ?? false);
      setPhotoIds(ids);
      setPhotos(await loadPhotos(db, ids));
      if (fromDraft) {
        setStatus(t('chronicle.editor.draftRestored'));
      }
    })().catch(() => setData(null));
  }, [db, id, entryId, t]);

  // Черновик сохраняется сам, когда игрок перестал печатать.
  useEffect(() => {
    if (!dirty) {
      return;
    }
    const timer = setTimeout(() => {
      saveDraft(db, { campaignId: id, entryId: entryId ?? null, text: fromMentionDoc(doc), tags, secret, photoIds })
        .then(() => setStatus(t('chronicle.editor.draftSaved')))
        .catch(() => undefined);
    }, DRAFT_SAVE_MS);
    return () => clearTimeout(timer);
  }, [db, id, entryId, doc, tags, secret, photoIds, dirty, t]);

  const query = useMemo(() => findMentionQuery(doc, cursor), [doc, cursor]);

  if (data === undefined) {
    return null;
  }

  const change = (next: MentionDoc) => {
    setDoc(next);
    setDirty(true);
  };
  const moveCursor = (position: number) => {
    setCursor(position);
    setForcedCursor(position);
  };

  const pick = (entity: Entity) => {
    if (!query) {
      return;
    }
    const inserted = insertMention(doc, cursor, query, entity);
    change(inserted.doc);
    moveCursor(inserted.cursor);
  };

  const create = async (type: EntityType) => {
    if (!query) {
      return;
    }
    const now = new Date().toISOString();
    const entity = await saveEntity(db, {
      id: newId(),
      campaignId: id,
      type,
      name: entityNameFromQuery(query.query),
      role: '',
      description: '',
      status: type === 'person' ? 'alive' : type === 'quest' ? 'active' : undefined,
      attitude: 0,
      personal: false,
      createdAt: now,
      updatedAt: now,
    });
    setEntities((list) => [...list, entity]);
    if (type === 'person') {
      await recordEvent(db, { type: 'person', entityId: entity.id, name: entity.name }, { campaignId: id });
    } else if (type === 'quest') {
      await recordEvent(
        db,
        { type: 'quest', questId: entity.id, name: entity.name, change: 'new' },
        { campaignId: id },
      );
    }
    pick(entity);
  };

  const addAt = () => {
    const next = withAt(doc.text, cursor);
    change(applyTextChange(doc, next.text));
    moveCursor(next.cursor);
  };

  const addPhoto = async () => {
    try {
      const base64 = await pickPhoto();
      if (!base64) {
        return;
      }
      const photoId = await savePhoto(db, base64);
      setPhotos((map) => ({ ...map, [photoId]: `data:image/jpeg;base64,${base64}` }));
      setPhotoIds((list) => [...list, photoId]);
      setDirty(true);
    } catch (error) {
      Alert.alert(t('chronicle.failed'), error instanceof Error ? error.message : String(error));
    }
  };

  const text = fromMentionDoc(doc).trim();
  const empty = !text && photoIds.length === 0;

  const close = () => {
    if (!original && empty) {
      clearDraft(db).catch(() => undefined);
    }
    router.back();
  };

  const done = async () => {
    if (empty || !data) {
      return;
    }
    const now = new Date().toISOString();
    const entry: Entry = original
      ? { ...original, text, tags, secret, photoIds }
      : {
          id: newId(),
          campaignId: id,
          sessionId: activeSessionOf(data.sessions)?.id ?? null,
          kind: 'note',
          createdAt: now,
          text,
          tags,
          secret,
          photoIds,
          updatedAt: now,
        };
    await saveEntry(db, entry);
    await deletePhotos(
      db,
      (original?.photoIds ?? []).filter((photoId) => !photoIds.includes(photoId)),
    );
    await clearDraft(db);
    router.back();
  };

  const session = data
    ? original
      ? data.sessions.find((item) => item.id === original.sessionId)
      : activeSessionOf(data.sessions)
    : null;
  const subtitle = [
    session ? t('chronicle.session.title', { number: session.number }) : t('chronicle.between'),
    formatTime(original?.createdAt ?? startedAt),
  ].join(' · ');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={close}
            style={styles.icon}
          >
            <MaterialCommunityIcons name="close" size={26} color={colors.text} />
          </Pressable>
          <View style={styles.titleWrap}>
            <AppText style={styles.title}>
              {original ? t('chronicle.editor.editTitle') : t('chronicle.editor.newTitle')}
            </AppText>
            <AppText style={styles.subtitle}>{subtitle}</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={empty}
            onPress={done}
            style={[styles.done, empty && styles.doneDisabled]}
          >
            <AppText style={styles.doneText}>{t('common.done')}</AppText>
          </Pressable>
        </View>

        <View style={styles.tags}>
          <ChipRow>
            {ENTRY_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={t(`chronicle.tag.${tag}`)}
                selected={tags.includes(tag)}
                onPress={() => {
                  setTags((list) => (list.includes(tag) ? list.filter((other) => other !== tag) : [...list, tag]));
                  setDirty(true);
                }}
              />
            ))}
          </ChipRow>
        </View>

        {photoIds.length ? (
          <View style={styles.photos}>
            {photoIds.map((photoId, i) => (
              <View key={photoId}>
                {photos[photoId] ? (
                  <Pressable
                    accessibilityRole="imagebutton"
                    accessibilityLabel={t('chronicle.photoOpen')}
                    onPress={() => setOpenedPhoto(i)}
                  >
                    <Image source={{ uri: photos[photoId] }} style={styles.photo} />
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('chronicle.editor.removePhoto')}
                  onPress={() => {
                    setPhotoIds((list) => list.filter((other) => other !== photoId));
                    setDirty(true);
                  }}
                  style={styles.photoRemove}
                >
                  <MaterialCommunityIcons name="close" size={14} color={colors.text} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <MentionInput
          doc={doc}
          onChange={change}
          onCursor={(position) => {
            setCursor(position);
            setForcedCursor(null);
          }}
          forcedCursor={forcedCursor}
          placeholder={t('chronicle.editor.placeholder')}
        />

        {query ? (
          <MentionSuggestions
            query={query.query}
            entities={entities}
            entries={data?.entries ?? []}
            onPick={pick}
            onCreate={(type) =>
              create(type).catch((error) =>
                Alert.alert(t('chronicle.failed'), error instanceof Error ? error.message : String(error)),
              )
            }
          />
        ) : null}
        <EntryToolbar
          onMention={addAt}
          onPhoto={addPhoto}
          secret={secret}
          onToggleSecret={() => {
            setSecret((value) => !value);
            setDirty(true);
          }}
          status={secret ? t('chronicle.editor.secretOn') : status}
        />
      </KeyboardAvoidingView>
      <PhotoViewer
        uris={photoIds.filter((photoId) => photos[photoId]).map((photoId) => photos[photoId])}
        index={openedPhoto}
        onClose={() => setOpenedPhoto(null)}
      />
    </SafeAreaView>
  );
}

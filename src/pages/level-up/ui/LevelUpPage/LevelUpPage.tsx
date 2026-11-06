import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';

import type { JournalState } from '@/entities/campaign';
import { getCampaign, journalState } from '@/entities/campaign/api';
import type { Character, HpChoice } from '@/entities/character';
import { totalLevel } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { SpellsEditSheet } from '@/features/edit-spells';
import type { LevelChoice, LevelUpCard, PickedItem } from '@/features/level-up';
import {
  activePending,
  applyLevelUp,
  beginLevelUp,
  countsText,
  cardA11yLabel,
  cardFullText,
  cardTitle,
  cardFooter,
  cardNext,
  cardSubtitle,
  cardUnlocked,
  defaultCardStyle,
  pickCardStats,
  playLevelUpSound,
  IntroBackground,
  levelUpBase,
  levelUpDeck,
  MAX_LEVEL,
  pendingDraft,
  pickedItems,
  revealCards,
  setPendingHp,
  stopLevelUpSound,
  storeDraft,
  useDeckMotion,
  useLevelUpSettings,
} from '@/features/level-up';
import { useDiceSettings } from '@/features/roll-dice';
import { byId, content, nameOf } from '@/shared/content';
import { t } from '@/shared/i18n';
import { Button, DetailSheet, Screen } from '@/shared/ui';

import type { DeckStage } from '../../lib/deckScreen';
import { classLine, deckSubtitle, resumeStage } from '../../lib/deckScreen';
import { CardsStep } from '../CardsStep/CardsStep';
import { ChoiceSheet } from '../ChoiceSheet/ChoiceSheet';
import { ClassSheet } from '../ClassSheet/ClassSheet';
import { DoneStep } from '../DoneStep/DoneStep';
import { HpStep } from '../HpStep/HpStep';
import { StartStep } from '../StartStep/StartStep';
import { StepHeader } from '../StepHeader/StepHeader';
import { styles } from './LevelUpPage.styles';

const KEEP = 'keep:';
const now = () => new Date().toISOString();

/**
 * Повышение уровня «Колода новинок» (docs/features/level-up.md): У1 новый уровень → У2 хиты → У3 карты
 * (выборы в шторке У4) → У5 итог. Всё до итога хранится в отложенном повышении у персонажа.
 */
export function LevelUpPage() {
  const { character, update } = usePlay();
  const db = useSQLiteContext();
  const settings = useLevelUpSettings();
  const motion = useDeckMotion();
  const [skipped, setSkipped] = useState(false);
  const [playKey, setPlayKey] = useState(0);
  const dice = useDiceSettings();
  const [chosenStage, setStage] = useState<DeckStage | null>(null);
  // Карта, нажатая на первом экране: экран карт сразу прокручивается к ней.
  const [focus, setFocus] = useState<string | null>(null);
  const [more, setMore] = useState<LevelUpCard | null>(null);
  const [choice, setChoice] = useState<LevelChoice | null>(null);
  const [spellsFor, setSpellsFor] = useState<string | null>(null);
  const [classSheet, setClassSheet] = useState(false);
  const [journal, setJournal] = useState<JournalState>({ kind: 'none' });
  const [campaignName, setCampaignName] = useState('');
  // Экран закрывается после «К листу»: новое повышение в этот момент начинать не нужно.
  const leaving = useRef(false);
  const pending = activePending(character);
  // Экран остаётся в памяти между повышениями: новое отложенное повышение начинается с первого шага.
  const session = pending ? `${pending.fromLevel}:${pending.startedAt}` : '';
  const [shownSession, setShownSession] = useState(session);
  if (shownSession !== session) {
    setShownSession(session);
    setStage(null);
    setFocus(null);
    setMore(null);
    setSkipped(false);
    setChoice(null);
    setSpellsFor(null);
    setClassSheet(false);
  }
  // Отложенное повышение продолжается с того шага, где его оставили.
  const stage = chosenStage ?? (pending ? resumeStage(pending) : null);

  useFocusEffect(
    useCallback(() => {
      leaving.current = false;
    }, []),
  );
  useFocusEffect(
    useCallback(() => {
      if (!leaving.current && !activePending(character) && totalLevel(character.classes) < MAX_LEVEL) {
        update((c) => ({ ...c, pendingLevelUp: beginLevelUp(c, c.classes[0].classId, now()) }), { journal: false });
      }
    }, [character, update]),
  );
  useEffect(() => {
    journalState(db, character.id)
      .then(async (state) => {
        setJournal(state);
        if (state.kind === 'session' || state.kind === 'between') {
          setCampaignName((await getCampaign(db, state.campaignId))?.name ?? '');
        }
      })
      .catch(() => undefined);
  }, [db, character.id]);

  const prev = levelUpBase(character) as Character;
  const next = pendingDraft(character, pending);
  const deck = useMemo(
    () => (pending && next ? levelUpDeck(prev, next, content, { hp: pending.hp, revealed: pending.revealed }) : null),
    // Колода пересчитывается после каждого изменения персонажа (выбора, броска, переворота).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [character],
  );

  if (!pending || !next || !deck || !stage) {
    return null;
  }

  const classId = pending.classId;
  const entry = next.classes.find((e) => e.classId === classId)!;
  const level = totalLevel(next.classes);
  const className = nameOf('classes', classId);
  const context = { attacks: deck.after.sheet.attacks };
  const kept = pending.revealed.filter((id) => id.startsWith(KEEP)).map((id) => id.slice(KEEP.length));
  const capstone = deck.cards.some((card) => card.type === 'capstone');
  const hasNext = level < MAX_LEVEL;
  const rollLocked = pending.hp?.method === 'roll' && !settings.allowHpReroll;
  const hpCard = deck.cards[0];
  const die = byId.classes.get(classId)?.hitDie ?? 8;

  const quiet = { journal: false };
  const set = (fn: (c: Character) => Character) => update((c) => storeDraft(c, fn(pendingDraft(c) ?? next)), quiet);
  const reveal = (ids: string[]) => update((c) => revealCards(c, ids), quiet);
  const setHp = (hp: HpChoice | undefined) => update((c) => setPendingHp(c, hp, settings.allowHpReroll), quiet);
  const pickClass = (id: string) => {
    setClassSheet(false);
    if (id !== classId && !rollLocked) {
      // Тот же сеанс повышения: время начала сохраняется, экран не сбрасывается.
      update((c) => ({ ...c, pendingLevelUp: beginLevelUp(c, id, pending.startedAt) }), quiet);
    }
  };
  const toSheet = () => router.navigate({ pathname: '/character/[id]', params: { id: character.id } });
  const back = () => {
    if (stage === 'start') {
      toSheet();
    } else {
      setStage(stage === 'done' ? 'cards' : stage === 'cards' ? 'hp' : 'start');
    }
  };
  // Рост — не сюрприз, у него нет рубашки; хиты открыты, когда решены.
  const growthIds = deck.cards.filter((c) => c.type === 'growth').map((c) => c.id);
  const openCards = () => {
    reveal(['hp', ...growthIds]);
    setStage('cards');
  };
  const openCard = (id: string) => {
    reveal([...(pending.hp ? ['hp'] : []), ...growthIds, id]);
    setFocus(id);
    setStage('cards');
  };
  const picked: Record<string, PickedItem[]> = Object.fromEntries(
    deck.cards.map((c) => [c.id, c.choice ? pickedItems(c.choice, prev, next, content) : []]),
  );
  const settled = [
    ...kept,
    ...deck.cards.filter((c) => c.choice && !c.choice.required && picked[c.id].length).map((c) => c.choice!.id),
  ];
  const choose = (picked: LevelChoice) =>
    picked.kind === 'spells' || picked.kind === 'spellbook' ? setSpellsFor(picked.classId) : setChoice(picked);
  const finish = () => {
    leaving.current = true;
    update((c) => applyLevelUp(c, content));
    toSheet();
  };
  // Удар при смене цифры уровня — вибрация «успех»; звук повышения играет с начала заполнения кольца.
  const impact = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };
  const fillSound = () => {
    if (dice.sound) {
      playLevelUpSound();
    }
  };
  // Начатое повышение можно бросить: выборы и брошенные хиты сбросятся.
  const started = !!pending.hp || pending.revealed.length > 0 || Object.keys(pending.choices).length > 0;
  const discard = () =>
    Alert.alert(t('levelUpPage.discard'), t('levelUpPage.discardConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('levelUpPage.discard'),
        style: 'destructive',
        onPress: () => {
          leaving.current = true;
          update((c) => ({ ...c, pendingLevelUp: undefined }), quiet);
          toSheet();
        },
      },
    ]);
  // --- Итог ---
  const inCampaign = journal.kind === 'session' || journal.kind === 'between';
  const chronicleText =
    journal.kind === 'session'
      ? t('levelUpDeck.done.chronicle', { number: journal.number })
      : journal.kind === 'between'
        ? t('levelUpDeck.done.chronicleBetween')
        : undefined;
  const cardStyle = defaultCardStyle(character);
  const stats =
    stage === 'done'
      ? pickCardStats(
          deck.before,
          deck.after,
          content,
          next.expertise.filter((id) => !prev.expertise.includes(id)),
        )
      : [];
  const heroCard = {
    name: character.name,
    letter: (character.name.trim()[0] ?? '?').toLocaleUpperCase(),
    portrait: character.portrait,
    subtitle: cardSubtitle(next),
    level,
    stats,
    unlocked: stage === 'done' ? cardUnlocked(deck, prev, next, content) : '',
    next: stage === 'done' ? cardNext(next, content, classId) : null,
    footer: cardFooter(
      inCampaign ? campaignName : undefined,
      journal.kind === 'session' ? journal.number : undefined,
      new Date(),
    ),
    accessibilityLabel: cardA11yLabel(character.name, level, stats),
  };

  if (stage === 'done') {
    return (
      <DoneStep
        {...heroCard}
        legend={capstone}
        chronicleText={chronicleText}
        style={cardStyle}
        onStyle={(heroCardStyle) => update((c) => ({ ...c, heroCardStyle }), quiet)}
        onToSheet={finish}
        storyTitle={t('heroCard.storyTitle', { name: character.name, level })}
        campaignLine={
          inCampaign
            ? [campaignName, journal.kind === 'session' ? t('heroCard.session', { number: journal.number }) : '']
                .filter(Boolean)
                .join(' · ')
            : undefined
        }
      />
    );
  }

  // --- Шторки: выборы, заклинания, класс, полное описание ---
  const sheets = (
    <>
      <ChoiceSheet choice={choice} prev={prev} next={next} set={set} onClose={() => setChoice(null)} />
      <SpellsEditSheet
        visible={!!spellsFor}
        character={next}
        classId={spellsFor ?? undefined}
        onChange={set}
        onClose={() => setSpellsFor(null)}
      />
      <ClassSheet
        visible={classSheet}
        character={prev}
        classId={classId}
        onPick={pickClass}
        onClose={() => setClassSheet(false)}
      />
      <DetailSheet
        ids={more ? [more.id] : []}
        id={more?.id ?? null}
        detail={() => (more ? { title: cardTitle(more, context), text: cardFullText(more) } : null)}
        onNavigate={() => undefined}
        onClose={() => setMore(null)}
      />
    </>
  );

  if (stage === 'cards') {
    return (
      <>
        <CardsStep
          deck={deck}
          before={deck.before}
          after={deck.after}
          title={t('levelUpDeck.newOnLevel', { level })}
          subtitle={deckSubtitle(character.name, next, classId)}
          hpDecided={!!pending.hp}
          focus={focus}
          picked={picked}
          kept={kept}
          settled={settled}
          animate={motion}
          context={context}
          notes={Object.fromEntries(
            deck.cards
              .filter((c) => c.choice?.kind === 'expertise' && prev.expertise.length)
              .map((c) => [
                c.id,
                t('levelUpDeck.expertiseHas', { list: prev.expertise.map((id) => nameOf('skills', id)).join(', ') }),
              ]),
          )}
          onBack={back}
          onRollHp={() => setStage('hp')}
          onReveal={reveal}
          onChoose={choose}
          onKeep={(item) => reveal([`${KEEP}${item.id}`])}
          onMore={setMore}
          onNext={() => setStage('done')}
        />
        {sheets}
      </>
    );
  }

  // --- Кнопка внизу ---
  const footer =
    stage === 'start' ? (
      <>
        {motion && !skipped ? (
          <Pressable accessibilityRole="button" onPress={() => setSkipped(true)} style={styles.link}>
            <Text style={styles.linkText}>{t('levelUpDeck.skipAnimation')}</Text>
          </Pressable>
        ) : null}
        <Button title={t('levelUpDeck.open')} onPress={() => setStage('hp')} />
        {started ? (
          <Pressable accessibilityRole="button" onPress={discard} style={styles.link}>
            <Text style={styles.linkText}>{t('levelUpPage.discard')}</Text>
          </Pressable>
        ) : null}
      </>
    ) : stage === 'hp' ? (
      <Button
        title={pending.hp ? t('levelUpDeck.next') : t('levelUpDeck.hp.needRoll')}
        disabled={!pending.hp}
        onPress={openCards}
      />
    ) : null;

  return (
    <Screen
      footer={footer}
      background={
        stage === 'start' ? (
          <IntroBackground animate={motion && !skipped} playKey={playKey} capstone={capstone} />
        ) : undefined
      }
    >
      <StepHeader
        kind={stage === 'start' ? 'close' : 'back'}
        onPress={back}
        progress={stage === 'hp' ? { total: 3, done: 1 } : undefined}
      />

      {stage === 'start' ? (
        <StartStep
          name={character.name}
          subtitle={`${classLine(next, classId)} · ${countsText(deck.cards.length + (hasNext ? 1 : 0), deck.counts.choices)}`}
          from={totalLevel(prev.classes)}
          to={level}
          cards={deck.cards}
          hasNext={hasNext}
          capstone={capstone}
          animate={motion && !skipped}
          playKey={playKey}
          onReplay={() => {
            setSkipped(false);
            setPlayKey((key) => key + 1);
          }}
          onFill={fillSound}
          onCancel={stopLevelUpSound}
          onImpact={impact}
          current={{
            classId: prev.classes[0].classId,
            title: t('levelUpDeck.classLevel', {
              className: nameOf('classes', prev.classes[0].classId),
              level: prev.classes[0].level + 1,
            }),
            sub: t('levelUpDeck.continuePath'),
          }}
          other={{
            classId,
            title:
              classId === prev.classes[0].classId
                ? t('levelUpDeck.otherClass')
                : t('levelUpDeck.classLevel', { className, level: entry.level }),
            sub: t('levelUpDeck.multiclass'),
          }}
          isOther={classId !== prev.classes[0].classId}
          classLocked={rollLocked ? t('levelUpDeck.hp.locked') : undefined}
          onCurrent={() => pickClass(prev.classes[0].classId)}
          onOther={() => setClassSheet(true)}
          onCard={openCard}
        />
      ) : null}

      {stage === 'hp' ? (
        <HpStep
          card={hpCard}
          die={die}
          className={className}
          hp={pending.hp}
          defaultMethod={character.hpMethod ?? 'average'}
          allowReroll={settings.allowHpReroll}
          onChange={setHp}
        />
      ) : null}

      {sheets}
    </Screen>
  );
}

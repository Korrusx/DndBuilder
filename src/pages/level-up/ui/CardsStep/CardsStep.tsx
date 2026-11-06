import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import Animated, { Easing, LinearTransition } from 'react-native-reanimated';

import {
  DeckFooter,
  DeckHeader,
  DECK_UI,
  DeckTiles,
  TRANSITION,
  GrowthCard,
  HpCard,
  LevelUpCardView,
  deckProgress,
  firstPendingCard,
  isChoiceSettled,
  useShake,
} from '@/features/level-up';
import { t } from '@/shared/i18n';

import { HP_RESULT, LIST_RESIZE, REVEAL_STEP } from '../../config/constants';
import { useCardScroll } from '../../lib/useCardScroll';
import { useHpRoll } from '../../lib/useHpRoll';
import { HpTable } from '../HpTable/HpTable';
import { ManualDieSheet } from '../ManualDieSheet/ManualDieSheet';
import { DealIn } from './DealIn';
import { styles } from './CardsStep.styles';
import type { CardsStepProps } from './CardsStep.types';

const RESIZE = LinearTransition.duration(LIST_RESIZE).easing(Easing.inOut(Easing.ease));

/**
 * У3 · «Новое на N-м уровне»: шапка, счётчик и лента закреплены,
 * карты списком (развёрнута одна), «Дальше» поверх списка. Один экран для одной новинки и для пятнадцати.
 */
export function CardsStep(props: CardsStepProps) {
  const { deck, settled, animate, onReveal, hpDecided } = props;
  const cards = deck.cards;
  const progress = deckProgress(deck, settled, hpDecided);
  // Плитки ленты — после последней раздаваемой карты (видимых на экране — около пяти).
  const tilesAt = TRANSITION.dealStart + Math.min(cards.length - 1, 4) * TRANSITION.dealStep + TRANSITION.dealDuration;
  // Развёрнутость не хранится: при входе — первая незавершённая карта.
  const [expanded, setExpanded] = useState<string | null>(() => firstPendingCard(deck, settled, hpDecided));
  const [growthOpen, setGrowthOpen] = useState(false);
  const [fresh, setFresh] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { list, scrollTo, onLayout } = useCardScroll(animate);
  const hpRoll = useHpRoll(props.die, props.hp, props.allowReroll, props.onHp);
  // Встряхивание бросает кость, пока карта хитов развёрнута и хиты не брошены.
  useShake(expanded === 'hp' && !hpDecided, hpRoll.roll);

  // После броска: 600 мс итог в карте, потом она сворачивается и разворачивается следующая незавершённая.
  const [hpResult, setHpResult] = useState(false);
  const hpKey = props.hp ? `${props.hp.method}:${props.hp.value}` : '';
  const shownHp = useRef(hpKey);
  const latest = useRef({ deck, settled });
  useEffect(() => {
    latest.current = { deck, settled };
  });
  useEffect(() => {
    if (!hpKey || hpKey === shownHp.current) {
      shownHp.current = hpKey;
      return;
    }
    shownHp.current = hpKey;
    setHpResult(true);
    const timer = setTimeout(() => {
      setHpResult(false);
      const next = firstPendingCard(latest.current.deck, latest.current.settled, true);
      setExpanded(next);
      if (next) {
        scrollTo(next);
      }
    }, HP_RESULT);
    return () => clearTimeout(timer);
  }, [hpKey, scrollTo]);
  // Выбор сделан — лёгкая вибрация (раздел 8). Первый показ экрана не вибрирует.
  const settledBefore = useRef<Set<string> | null>(null);
  const settledNow = cards.filter((card) => card.choice && isChoiceSettled(card, settled)).map((card) => card.id);
  useEffect(() => {
    const was = settledBefore.current;
    if (was && settledNow.some((id) => !was.has(id))) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    settledBefore.current = new Set(settledNow);
  }, [settledNow.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (props.intro) {
      // Конец перехода из ритуала — одна вибрация.
      timers.current.push(setTimeout(() => Haptics.selectionAsync().catch(() => undefined), TRANSITION.total));
    }
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
    // Только при входе на экран.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (id: string) => {
    const card = cards.find((item) => item.id === id);
    if (card?.state === 'hidden') {
      onReveal([id]);
      setFresh((ids) => [...ids, id]);
      Haptics.selectionAsync().catch(() => undefined);
    }
    if (card?.type !== 'growth') {
      setExpanded(id);
    }
    scrollTo(id);
  };
  const toggle = (id: string) => {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    scrollTo(id);
  };
  const revealAll = () => {
    const hidden = cards.filter((card) => card.state === 'hidden').map((card) => card.id);
    // После переворота — первая карта с несделанным выбором, если такая есть.
    const choice = cards.find((card) => !isChoiceSettled(card, settled))?.id;
    const finish = () => {
      if (choice) {
        setExpanded(choice);
        scrollTo(choice);
      }
    };
    setFresh((ids) => [...ids, ...hidden]);
    if (!animate) {
      onReveal(hidden);
      finish();
      return;
    }
    hidden.forEach((id, i) => timers.current.push(setTimeout(() => onReveal([id]), i * REVEAL_STEP)));
    timers.current.push(setTimeout(finish, hidden.length * REVEAL_STEP));
  };
  const blocked = () => {
    const id = firstPendingCard(deck, settled, hpDecided);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    if (id) {
      setExpanded(id);
      scrollTo(id);
    }
  };

  return (
    <View style={styles.screen}>
      <DeckHeader
        level={props.level}
        capstone={props.capstone}
        badgeHidden={props.badgeHidden}
        badgeRef={props.badgeRef}
        onBadgeLayout={props.onBadgeLayout}
        intro={!!props.intro}
        title={props.title}
        subtitle={props.subtitle}
        progress={progress}
        onBack={props.onBack}
        onRevealAll={revealAll}
      >
        <DeckTiles
          cards={cards}
          current={expanded}
          settled={settled}
          onSelect={open}
          appearAt={props.intro ? tilesAt : undefined}
          hpDecided={hpDecided}
        />
      </DeckHeader>

      <ScrollView ref={list} style={styles.list} contentContainerStyle={styles.content}>
        {cards.map((card, index) => (
          <Animated.View key={card.id} onLayout={onLayout(card.id)} layout={animate ? RESIZE : undefined}>
            <DealIn index={index} origin={props.intro}>
              {card.type === 'hp' ? (
                <HpCard
                  card={card}
                  decided={hpDecided}
                  expanded={expanded === card.id}
                  showResult={hpResult}
                  canReroll={!hpRoll.locked}
                  ownDice={props.ownDice}
                  onToggle={() => toggle(card.id)}
                  onRoll={hpRoll.roll}
                  onAverage={hpRoll.average}
                  onManual={hpRoll.openManual}
                />
              ) : card.type === 'growth' ? (
                <GrowthCard
                  card={card}
                  open={growthOpen}
                  onToggle={() => setGrowthOpen((value) => !value)}
                  context={props.context}
                />
              ) : (
                <LevelUpCardView
                  card={card}
                  expanded={expanded === card.id}
                  animate={animate}
                  fresh={fresh.includes(card.id)}
                  picked={props.picked[card.id] ?? []}
                  kept={!!card.choice && props.kept.includes(card.choice.id)}
                  settled={isChoiceSettled(card, settled)}
                  context={props.context}
                  slots={card.type === 'magic' ? { before: props.before.slots, after: props.after.slots } : undefined}
                  note={props.notes[card.id]}
                  onOpen={() => open(card.id)}
                  onToggle={() => toggle(card.id)}
                  onChoose={props.onChoose}
                  onKeep={props.onKeep}
                  onMore={props.onMore}
                />
              )}
            </DealIn>
          </Animated.View>
        ))}
        {props.unchanged ? (
          <View style={styles.unchanged}>
            <Feather name="info" size={16} color={DECK_UI.muted} />
            <Text style={styles.unchangedText}>{t('levelUpDeck.screen.unchanged', { text: props.unchanged })}</Text>
          </View>
        ) : null}
      </ScrollView>

      <HpTable
        roll={hpRoll.table}
        settings={hpRoll.diceSettings}
        onLanded={hpRoll.landed}
        onError={hpRoll.tableFailed}
      />
      <ManualDieSheet visible={hpRoll.manualOpen} die={props.die} onPick={hpRoll.manual} onClose={hpRoll.closeManual} />
      <DeckFooter
        title={t('levelUpDeck.next')}
        ready={progress.ready && deck.blockers.length === 0}
        hint={progress.hint}
        onNext={props.onNext}
        onBlocked={blocked}
        intro={!!props.intro}
      />
    </View>
  );
}

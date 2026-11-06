import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { Easing, LinearTransition } from 'react-native-reanimated';

import {
  DeckFooter,
  DeckHeader,
  DeckTiles,
  GrowthCard,
  HpRow,
  LevelUpCardView,
  deckProgress,
  firstPendingCard,
  isChoiceSettled,
} from '@/features/level-up';
import { t } from '@/shared/i18n';

import { LIST_RESIZE, REVEAL_STEP } from '../../config/constants';
import { useCardScroll } from '../../lib/useCardScroll';
import { styles } from './CardsStep.styles';
import type { CardsStepProps } from './CardsStep.types';

const RESIZE = LinearTransition.duration(LIST_RESIZE).easing(Easing.inOut(Easing.ease));

/**
 * У3 · «Новое на N-м уровне» (design/level-up/deck-screen-spec.md): шапка, счётчик и лента закреплены,
 * карты списком (развёрнута одна), «Дальше» поверх списка. Один экран для одной новинки и для пятнадцати.
 */
export function CardsStep(props: CardsStepProps) {
  const { deck, settled, animate, onReveal } = props;
  const cards = deck.cards;
  const progress = deckProgress(deck, settled);
  // Развёрнутость не хранится: при входе — карта, с которой вошли, или первая незавершённая.
  const [expanded, setExpanded] = useState<string | null>(() => props.focus ?? firstPendingCard(deck, settled));
  const [growthOpen, setGrowthOpen] = useState(false);
  const [fresh, setFresh] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { list, scrollTo, onLayout } = useCardScroll(animate);
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
    if (props.focus) {
      scrollTo(props.focus);
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
    if (card?.type !== 'hp' && card?.type !== 'growth') {
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
    const id = firstPendingCard(deck, settled);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    if (id) {
      setExpanded(id);
      scrollTo(id);
    }
  };

  return (
    <View style={styles.screen}>
      <DeckHeader
        title={props.title}
        subtitle={props.subtitle}
        progress={progress}
        onBack={props.onBack}
        onRevealAll={revealAll}
      >
        <DeckTiles cards={cards} current={expanded} settled={settled} onSelect={open} />
      </DeckHeader>

      <ScrollView ref={list} style={styles.list} contentContainerStyle={styles.content}>
        {cards.map((card) => (
          <Animated.View key={card.id} onLayout={onLayout(card.id)} layout={animate ? RESIZE : undefined}>
            {card.type === 'hp' ? (
              <HpRow card={card} decided={props.hpDecided} onRoll={props.onRollHp} />
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
          </Animated.View>
        ))}
      </ScrollView>

      <DeckFooter
        title={t('levelUpDeck.next')}
        ready={progress.ready && deck.blockers.length === 0}
        hint={progress.hint}
        onNext={props.onNext}
        onBlocked={blocked}
      />
    </View>
  );
}

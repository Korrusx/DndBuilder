import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollViewInstance } from 'react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { CardBack, DeckCardView, DeckStrip, FlipCard, cardShortTitle } from '@/features/level-up';
import { rarityColors } from '@/shared/config';
import { t } from '@/shared/i18n';

import { unchangedText } from '../../lib/deckScreen';
import { styles } from './CardsStep.styles';
import type { CardsStepProps } from './CardsStep.types';

const REVEAL_STEP = 80;

/**
 * У3 · Открытие карт: лента колоды, текущая карта (нажатие переворачивает, свайп листает), «Открыть все»,
 * блок «Без изменений». Карты магии и вида — тот же просмотр (У7, У8).
 */
export function CardsStep(props: CardsStepProps) {
  const { deck, before, after, level, classLevel, current, onCurrent, onReveal, animate, context } = props;
  const pager = useRef<ScrollViewInstance>(null);
  const [width, setWidth] = useState(0);
  const cards = deck.cards;

  useEffect(() => {
    if (width && current < cards.length) {
      pager.current?.scrollTo({ x: current * width, animated: animate });
    }
  }, [current, width, cards.length, animate]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
    if (index !== current) {
      onCurrent(index);
    }
  };
  const revealAll = () => {
    const hidden = cards.filter((card) => card.state === 'hidden').map((card) => card.id);
    if (!animate) {
      onReveal(hidden);
      return;
    }
    hidden.forEach((id, i) => setTimeout(() => onReveal([id]), i * REVEAL_STEP));
  };
  const card = cards[current];
  const unchanged = deck.unchanged.length ? unchangedText(deck, after, context) : '';

  return (
    <>
      <View style={styles.head}>
        <Text style={styles.title}>{t('levelUpDeck.newOnLevel', { level })}</Text>
        <Text style={styles.sub}>{t('levelUpDeck.tapToFlip')}</Text>
      </View>

      <Text style={styles.stripCaption}>{t('levelUpDeck.deckOfLevel', { level }).toLocaleUpperCase()}</Text>
      <DeckStrip cards={cards} current={current} onSelect={(i) => onCurrent(Math.min(i, cards.length - 1))} />

      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width ? (
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            style={styles.pager}
          >
            {cards.map((item) => (
              <View key={item.id} style={[styles.page, { width }]}>
                <FlipCard
                  revealed={item.state !== 'hidden'}
                  animate={animate}
                  accessibilityLabel={cardShortTitle(item)}
                  onPress={item.state === 'hidden' ? () => onReveal([item.id]) : undefined}
                  back={
                    <CardBack
                      type={item.type}
                      label={t(`levelUpDeck.type.${item.type}`)}
                      dot={!!item.choice?.required}
                      note={t('levelUpDeck.notFlipped')}
                      sub={t('levelUpDeck.tapToFlip')}
                      style={styles.back}
                    />
                  }
                  front={
                    <DeckCardView
                      card={item}
                      classLevel={classLevel}
                      context={context}
                      slots={item.type === 'magic' ? { before: before.slots, after: after.slots } : undefined}
                      animate={animate}
                      onChoose={props.onChoose}
                      onKeep={props.onKeep}
                      kept={!!item.choice && props.kept.includes(item.choice.id)}
                      note={props.notes[item.id]}
                    />
                  }
                />
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {cards.some((item) => item.state === 'hidden') ? (
        <Pressable accessibilityRole="button" onPress={revealAll} style={styles.revealAll}>
          <Text style={styles.revealAllText}>{t('levelUpDeck.revealAll')}</Text>
        </Pressable>
      ) : null}

      {card?.type === 'species' ? (
        <View style={styles.hint}>
          <Feather name="info" size={18} color={rarityColors.rare} />
          <Text style={styles.hintText}>{t('levelUpDeck.speciesHint')}</Text>
        </View>
      ) : null}

      {unchanged ? (
        <View style={styles.unchanged}>
          <Text style={styles.unchangedCaption}>{t('levelUpDeck.unchanged').toLocaleUpperCase()}</Text>
          <Text style={styles.unchangedText}>{unchanged}</Text>
        </View>
      ) : null}
    </>
  );
}

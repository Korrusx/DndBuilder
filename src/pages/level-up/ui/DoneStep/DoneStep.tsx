import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CardStyle } from '@/features/level-up';
import {
  CARD_POSE,
  CardSparks,
  DONE_SCREEN,
  DONE_TIMELINE,
  doneInitial,
  HERO_CARD_THEMES,
  HeroCardView,
  neighborStyle,
  StyleBackdrop,
  StyleSwitcher,
  useDeckMotion,
  useStyleSwipe,
} from '@/features/level-up';
import { colors } from '@/shared/config';
import { t } from '@/shared/i18n';

import { CARD_MARGIN, CARD_MAX, styles } from './DoneStep.styles';
import type { DoneStepProps } from './DoneStep.types';

const RISE = Easing.bezier(0.2, 1.2, 0.3, 1);
const SHEEN = Easing.inOut(Easing.quad);

/** У5 · Итог: карта героя в выбранном стиле, смена стиля кнопками и свайпом, «Поделиться», «К листу». */
export function DoneStep(props: DoneStepProps) {
  const animate = useDeckMotion();
  const { width: screen } = useWindowDimensions();
  const cardWidth = Math.min(screen - CARD_MARGIN * 2, CARD_MAX);
  const [shown, setShown] = useState<CardStyle>(props.style);
  const theme = HERO_CARD_THEMES[shown];
  const start = doneInitial(animate);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const lift = useSharedValue(start.card.translateY);
  const scale = useSharedValue(start.card.scale);
  const tilt = useSharedValue(start.card.rotate);
  const opacity = useSharedValue(start.card.opacity);
  const flip = useSharedValue(0);
  const ui = useSharedValue(start.uiOpacity);
  const sheenProgress = useSharedValue(0);
  const sheenOpacity = useSharedValue(start.sheenOpacity);

  const runSheen = (delay: number) => {
    sheenProgress.set(0);
    sheenOpacity.set(
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 0 }),
          withDelay(DONE_TIMELINE.sheenDuration, withTiming(0, { duration: 0 })),
        ),
      ),
    );
    sheenProgress.set(withDelay(delay, withTiming(1, { duration: DONE_TIMELINE.sheenDuration, easing: SHEEN })));
  };

  useEffect(() => {
    if (!animate) {
      return;
    }
    const land = DONE_TIMELINE.cardLand;
    const settle = DONE_TIMELINE.cardRise - land;
    const pose = (key: 'translateY' | 'scale' | 'rotate' | 'opacity') =>
      withSequence(
        withTiming(CARD_POSE.overshoot[key], { duration: land, easing: RISE }),
        withTiming(CARD_POSE.rest[key], { duration: settle }),
      );
    lift.set(pose('translateY'));
    scale.set(pose('scale'));
    tilt.set(pose('rotate'));
    opacity.set(withTiming(1, { duration: land }));
    ui.set(withDelay(DONE_TIMELINE.uiStart, withTiming(1, { duration: DONE_TIMELINE.uiDuration })));
    runSheen(DONE_TIMELINE.sheenStart);
    timers.current.push(
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined), land),
    );
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      [lift, scale, tilt, opacity, ui, sheenProgress, sheenOpacity, flip].forEach((value) => cancelAnimation(value));
    };
    // Появление играет один раз при открытии экрана.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeStyle = (style: CardStyle) => {
    if (style === shown) {
      return;
    }
    props.onStyle(style);
    Haptics.selectionAsync().catch(() => undefined);
    if (!animate) {
      setShown(style);
      return;
    }
    const half = DONE_TIMELINE.flipHalf;
    flip.set(
      withSequence(
        withTiming(90, { duration: half, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: half, easing: Easing.out(Easing.quad) }),
      ),
    );
    timers.current.push(setTimeout(() => setShown(style), half));
    runSheen(half * 2);
  };
  const swipe = useStyleSwipe({
    onStep: (step) => {
      const next = neighborStyle(shown, step);
      if (next) {
        changeStyle(next);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [
      { perspective: 1000 },
      { translateY: lift.get() },
      { scale: scale.get() },
      { rotate: `${tilt.get()}deg` },
      { rotateY: `${flip.get()}deg` },
    ],
  }));
  const uiStyle = useAnimatedStyle(() => ({ opacity: ui.get(), transform: [{ translateY: 12 * (1 - ui.get()) }] }));

  return (
    <View style={styles.root}>
      <StyleBackdrop style={shown} animate={animate} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.column}>
          <View style={styles.head}>
            <Text style={[styles.kicker, { color: theme.accentLabel }]}>
              {t('heroCard.newLevel').toLocaleUpperCase()}
            </Text>
            <Text style={[styles.title, { color: DONE_SCREEN.title }]}>
              {props.legend ? t('heroCard.legend') : t('heroCard.title')}
            </Text>
          </View>

          <View style={styles.spacer} />

          <View style={[styles.cardBox, { width: cardWidth }]}>
            <CardSparks theme={theme} animate={animate} />
            <Animated.View style={cardStyle} {...swipe}>
              <HeroCardView
                theme={theme}
                size="full"
                width={cardWidth}
                name={props.name}
                letter={props.letter}
                portrait={props.portrait}
                subtitle={props.subtitle}
                level={props.level}
                stats={props.stats}
                unlocked={props.unlocked}
                next={props.next}
                footer={props.footer}
                accessibilityLabel={props.accessibilityLabel}
                motion={animate ? { sheenProgress, sheenOpacity } : undefined}
              />
            </Animated.View>
          </View>

          <View style={styles.spacer} />

          <Animated.View style={[styles.bottom, uiStyle]}>
            <StyleSwitcher value={shown} onChange={changeStyle} />
            {props.shareError ? <Text style={[styles.error, { color: colors.damage }]}>{props.shareError}</Text> : null}
            <View style={styles.buttons}>
              <Pressable
                accessibilityRole="button"
                onPress={props.onShare}
                style={[styles.button, { backgroundColor: DONE_SCREEN.share.background }]}
              >
                <Feather name="share" size={18} color={DONE_SCREEN.share.text} />
                <Text style={[styles.buttonText, { color: DONE_SCREEN.share.text }]}>
                  {t('levelUpDeck.done.share')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={props.onToSheet}
                style={[
                  styles.button,
                  {
                    backgroundColor: DONE_SCREEN.toSheet.background,
                    borderWidth: 1,
                    borderColor: DONE_SCREEN.toSheet.border,
                  },
                ]}
              >
                <Text style={[styles.buttonText, { color: DONE_SCREEN.toSheet.text }]}>
                  {t('levelUpDeck.done.toSheet')}
                </Text>
              </Pressable>
            </View>
            {props.chronicleText ? (
              <View style={styles.chronicle}>
                <Feather name="check" size={14} color={DONE_SCREEN.chronicle} />
                <Text style={[styles.chronicleText, { color: DONE_SCREEN.chronicle }]}>{props.chronicleText}</Text>
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

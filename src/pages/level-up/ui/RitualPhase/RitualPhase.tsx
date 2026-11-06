import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import type { ViewInstance } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GLOW, IntroBackground, introTimeline, LevelRing, TRANSITION } from '@/features/level-up';
import { t } from '@/shared/i18n';

import { RITUAL, styles } from './RitualPhase.styles';
import type { RitualPhaseProps } from './RitualPhase.types';

/** Сдвиг нижнего блока перед проявлением. */
const ACTIONS_SHIFT = 14;

/**
 * Ритуал (шаг 1 нового потока): только торжественный момент — кольцо уровня, «<Имя> растёт», строка
 * о новинках и две кнопки. Нажатие в любом месте до удара (1550 мс) переводит анимацию сразу на удар.
 */
export function RitualPhase(props: RitualPhaseProps) {
  const { animate, capstone, playKey } = props;
  const insets = useSafeAreaInsets();
  const time = introTimeline(capstone);
  const [skipped, setSkipped] = useState(false);
  const [ready, setReady] = useState(!animate);
  const startedAt = useRef(0);
  const ring = useRef<ViewInstance>(null);
  const gone = useSharedValue(0);
  const backdrop = useSharedValue(1);
  const hint = useSharedValue(animate ? GLOW.hintDim : 1);
  const actions = useSharedValue(animate ? 0 : 1);

  // Экран пересоздаётся на каждое новое повышение (key у родителя): эффекты — только при показе.
  useEffect(() => {
    startedAt.current = Date.now();
    if (!animate) {
      props.onSound(time.reducedSound);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!animate) {
      return;
    }
    // После пропуска отсчёт идёт от удара.
    const offset = skipped ? time.impact : 0;
    cancelAnimation(hint);
    cancelAnimation(actions);
    hint.set(withDelay(time.hintStart - offset, withTiming(1, { duration: time.settle - time.hintStart })));
    actions.set(withDelay(time.hintStart - offset, withTiming(1, { duration: time.actionsEnd - time.hintStart })));
    const timer = setTimeout(() => setReady(true), time.actionsEnd - offset);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipped]);

  useEffect(() => {
    if (props.leaving) {
      const out = props.leaving === 'fade' ? TRANSITION.reduced : TRANSITION.fadeOut;
      gone.set(withTiming(1, { duration: out }));
      backdrop.set(withTiming(0, { duration: props.leaving === 'fade' ? out : TRANSITION.background }));
    }
  }, [props.leaving, gone, backdrop]);

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    ring.current?.measureInWindow((x, y, width, height) => props.onOpen({ x: x + width / 2, y: y + height / 2 }));
  };

  const skip = () => {
    if (animate && !skipped && Date.now() - startedAt.current < time.impact) {
      setSkipped(true);
      props.onSound(time.impact);
    }
  };

  const fadeStyle = useAnimatedStyle(() => ({ opacity: 1 - gone.get() }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.get() }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: hint.get() * (1 - gone.get()) }));
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actions.get() * (1 - gone.get()),
    transform: [{ translateY: (1 - actions.get()) * ACTIONS_SHIFT }],
  }));

  return (
    <Pressable
      accessible={false}
      onPress={skip}
      style={[styles.screen, { paddingTop: 10 + insets.top, paddingBottom: 18 + insets.bottom }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]} pointerEvents="none">
        <IntroBackground animate={animate} playKey={playKey} capstone={capstone} fromImpact={skipped} />
      </Animated.View>
      <Animated.View style={[styles.closeRow, props.leaving === 'fade' ? backdropStyle : fadeStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('levelUpDeck.ritual.postpone')}
          onPress={props.onClose}
          style={styles.close}
        >
          <Feather name="x" size={22} color={RITUAL.closeIcon} />
        </Pressable>
      </Animated.View>

      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          ref={ring}
          collapsable={false}
          style={props.leaving === 'flight' ? styles.hidden : props.leaving === 'fade' ? backdropStyle : undefined}
        >
          <LevelRing
            from={props.from}
            to={props.to}
            animate={animate}
            capstone={capstone}
            playKey={playKey}
            fromImpact={skipped}
            onPress={skip}
            onFill={() => props.onSound(time.fillStart)}
            onCancel={props.onCancel}
            onImpact={props.onImpact}
          />
        </Animated.View>
        <Animated.View style={[styles.who, hintStyle]}>
          <Text style={styles.name}>{t('levelUpDeck.grows', { name: props.name })}</Text>
          <Text style={styles.subtitle}>{props.subtitle}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.actions, actionsStyle]} pointerEvents={ready ? 'auto' : 'none'}>
        <Text style={styles.counts}>{props.counts}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={open}
          style={({ pressed }) => [styles.open, (pressed || !!props.leaving) && styles.openPressed]}
        >
          <Text style={styles.openText}>{t('levelUpDeck.ritual.open')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: props.multiclass.disabled }}
          disabled={props.multiclass.disabled}
          onPress={props.onOther}
          style={[styles.other, props.multiclass.disabled && styles.otherOff]}
        >
          <View style={styles.plate}>
            <Feather name="git-branch" size={18} color={RITUAL.accent} />
          </View>
          <View style={styles.otherLines}>
            <Text style={styles.otherTitle}>{t('levelUpDeck.ritual.otherClass')}</Text>
            <Text style={styles.otherNote}>{props.multiclass.note}</Text>
          </View>
          <Feather name="chevron-right" size={16} color={RITUAL.arrow} />
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GLOW, IntroBackground, introTimeline, LevelRing } from '@/features/level-up';
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

  const skip = () => {
    if (animate && !skipped && Date.now() - startedAt.current < time.impact) {
      setSkipped(true);
      props.onSound(time.impact);
    }
  };

  const hintStyle = useAnimatedStyle(() => ({ opacity: hint.get() }));
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actions.get(),
    transform: [{ translateY: (1 - actions.get()) * ACTIONS_SHIFT }],
  }));

  return (
    <Pressable
      accessible={false}
      onPress={skip}
      style={[styles.screen, { paddingTop: 10 + insets.top, paddingBottom: 18 + insets.bottom }]}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <IntroBackground animate={animate} playKey={playKey} capstone={capstone} fromImpact={skipped} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('levelUpDeck.ritual.postpone')}
        onPress={props.onClose}
        style={styles.close}
      >
        <Feather name="x" size={22} color={RITUAL.closeIcon} />
      </Pressable>

      <View style={styles.center} pointerEvents="box-none">
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
        <Animated.View style={[styles.who, hintStyle]}>
          <Text style={styles.name}>{t('levelUpDeck.grows', { name: props.name })}</Text>
          <Text style={styles.subtitle}>{props.subtitle}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.actions, actionsStyle]} pointerEvents={ready ? 'auto' : 'none'}>
        <Text style={styles.counts}>{props.counts}</Text>
        <Pressable accessibilityRole="button" onPress={props.onOpen} style={styles.open}>
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

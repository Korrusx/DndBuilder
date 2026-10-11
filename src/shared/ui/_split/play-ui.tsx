// Общие элементы режима игры.

import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { tr } from '@/shared/content/content';
import type { LocalizedText } from '@/shared/content/types';
import { AppText } from '../AppText/AppText';
import { BottomSheet } from '../BottomSheet/BottomSheet';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Плитка с числом: КЗ, инициатива, скорость… Нажатие — бросок или подробности. */
export function StatBox({ label, value, onPress, accent }: { label: string; value: string; onPress?: () => void; accent?: boolean }) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.stat, pressed && { opacity: 0.8 }]}
    >
      <AppText style={[styles.statValue, accent && { color: colors.accent }]}>{value}</AppText>
      <AppText style={styles.statLabel}>{label}</AppText>
    </Pressable>
  );
}

/** Небольшая кнопка (44 px) с цветом урона/лечения/акцента. */
export function SmallButton({
  title,
  onPress,
  tone = 'neutral',
  disabled,
  flex,
}: {
  title: string;
  onPress: () => void;
  tone?: 'neutral' | 'damage' | 'heal' | 'accent';
  disabled?: boolean;
  flex?: number;
}) {
  const palette = {
    neutral: { bg: colors.surface2, fg: colors.text },
    damage: { bg: colors.damageBg, fg: colors.damage },
    heal: { bg: colors.healBg, fg: colors.heal },
    accent: { bg: colors.accentBg, fg: colors.accent },
  }[tone];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.small,
        { backgroundColor: palette.bg, flex },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
      ]}
    >
      <AppText style={[styles.smallLabel, { color: palette.fg }]}>{title}</AppText>
    </Pressable>
  );
}

/** Кружки: потраченные ячейки, спасброски от смерти. */
export function Dots({
  total,
  filled,
  color = colors.accent,
  onPress,
}: {
  total: number;
  filled: number;
  color?: string;
  onPress?: (index: number) => void;
}) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <Pressable
          key={i}
          disabled={!onPress}
          onPress={() => onPress?.(i)}
          hitSlop={6}
          style={[styles.dot, { borderColor: color }, i < filled && { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

/** Текст справочника без разметки **жирного**. */
export function plain(text: LocalizedText | undefined): string {
  return tr(text).text.replace(/\*\*/g, '').replace(/\*/g, '');
}

/** Панель с описанием (умение, состояние, заклинание). */
export function InfoSheet({
  info,
  onClose,
  children,
}: {
  info: { title: string; text: string; subtitle?: string } | null;
  onClose: () => void;
  children?: ReactNode;
}) {
  return (
    <BottomSheet visible={!!info} title={info?.title} onClose={onClose}>
      {info?.subtitle ? <AppText variant="secondary">{info.subtitle}</AppText> : null}
      <AppText>{info?.text || 'Описание пока не переведено.'}</AppText>
      {children}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    minHeight: 72,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  statValue: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text },
  statLabel: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
  small: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLabel: { fontFamily: fonts.textBold, fontSize: 15 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
});

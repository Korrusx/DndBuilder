// Общие элементы экранов мастера создания.

import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Character } from '@/rules/character';
import { colors, fonts, radius, sizes, spacing } from '@/theme';
import { AppText } from '../AppText';
import { Button } from '../Button';
import { Screen } from '../Screen';
import { useDraft } from './DraftContext';
import { CREATE_STEPS } from './steps';

type WizardScreenProps = {
  step: number;
  children: ReactNode;
  /** Что выбрано на шаге — показывается над кнопкой «Далее». */
  summary?: ReactNode;
  canContinue: boolean;
  /** Вместо «Далее» (последний шаг). */
  footer?: ReactNode;
  /** Изменение перед сохранением (например, записать снаряжение в инвентарь). */
  prepare?: (c: Character) => Character;
};

/** Каркас шага: прогресс из 6 сегментов, заголовок, нижняя панель с «Далее». */
export function WizardScreen({ step, children, summary, canContinue, footer, prepare }: WizardScreenProps) {
  const { next } = useDraft();
  return (
    <Screen
      footer={
        footer ?? (
          <>
            {summary}
            <Button
              title="Далее"
              disabled={!canContinue}
              onPress={() => next(step, prepare)}
            />
          </>
        )
      }
    >
      <View style={styles.progress}>
        {CREATE_STEPS.map((s, i) => (
          <View key={s.title} style={[styles.segment, { backgroundColor: i < step ? colors.accent : colors.surface2 }]} />
        ))}
      </View>
      <AppText variant="secondary">
        Шаг {step} из {CREATE_STEPS.length}
      </AppText>
      <AppText variant="title">{CREATE_STEPS[step - 1].title}</AppText>
      {children}
    </Screen>
  );
}

/** Раздел шага: заголовок, счётчик «выбрано / нужно», подсказка. */
export function Section({
  title,
  hint,
  picked,
  need,
  children,
}: {
  title: string;
  hint?: string;
  picked?: number;
  need?: number;
  children: ReactNode;
}) {
  const done = need !== undefined && picked === need;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <AppText variant="heading" style={{ flex: 1 }}>
          {title}
        </AppText>
        {need !== undefined ? (
          <AppText style={[styles.counter, { color: done ? colors.heal : colors.accent }]}>
            {picked ?? 0} / {need}
          </AppText>
        ) : null}
      </View>
      {hint ? <AppText variant="secondary">{hint}</AppText> : null}
      {children}
    </View>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  /** Небольшая подпись (например, «от предыстории»). */
  note?: string;
  onPress?: () => void;
};

export function Chip({ label, selected, disabled, note, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        disabled && !selected && { opacity: 0.4 },
        pressed && { opacity: 0.8 },
      ]}
    >
      <AppText style={[styles.chipLabel, selected && { color: colors.accent }]}>{label}</AppText>
      {note ? <AppText style={styles.chipNote}>{note}</AppText> : null}
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

/**
 * Выбор нескольких вариантов из списка с ограничением.
 * `blocked` — варианты, которые уже даны или выбраны в другом месте.
 */
export function MultiPick({
  options,
  selected,
  max,
  label,
  blocked,
  onChange,
}: {
  options: string[];
  selected: string[];
  max: number;
  label: (id: string) => string;
  blocked?: Map<string, string>;
  onChange: (next: string[]) => void;
}) {
  const full = selected.length >= max;
  return (
    <ChipRow>
      {options.map((id) => {
        const isOn = selected.includes(id);
        const blockedNote = blocked?.get(id);
        return (
          <Chip
            key={id}
            label={label(id)}
            selected={isOn}
            note={blockedNote}
            disabled={!isOn && (full || !!blockedNote)}
            onPress={() => onChange(isOn ? selected.filter((x) => x !== id) : max === 1 ? [id] : [...selected, id])}
          />
        );
      })}
    </ChipRow>
  );
}

/** Карточка варианта (класс, предыстория, вид, набор снаряжения). */
export function OptionCard({
  title,
  lines,
  selected,
  onPress,
  compact,
}: {
  title: ReactNode;
  lines?: ReactNode[];
  selected?: boolean;
  /** Без обработчика — просто карточка с информацией. */
  onPress?: () => void;
  compact?: boolean;
}) {
  const body = (
    <>
      {typeof title === 'string' ? <AppText variant="heading">{title}</AppText> : title}
      {lines?.map((line, i) =>
        typeof line === 'string' ? (
          <AppText key={i} variant="secondary">
            {line}
          </AppText>
        ) : (
          <View key={i}>{line}</View>
        ),
      )}
    </>
  );
  if (!onPress) return <View style={[styles.card, compact && styles.cardCompact]}>{body}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        selected && styles.cardSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      {body}
    </Pressable>
  );
}

/** Строка над «Далее»: чего не хватает на шаге. */
export function StepStatus({ issues, done }: { issues: { message: string }[]; done?: ReactNode }) {
  if (issues.length === 0) return done ? <>{done}</> : null;
  return (
    <AppText variant="secondary" numberOfLines={2}>
      {issues[0].message}
      {issues.length > 1 ? ` (и ещё ${issues.length - 1})` : ''}
    </AppText>
  );
}

/** Переключатель из нескольких вариантов («Стандартный / Покупка очков / Броски»). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentedItem, on && { backgroundColor: colors.accent }]}
          >
            <AppText style={[styles.segmentedLabel, on && { color: colors.onAccent }]}>{o.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Подсказка в акцентной плашке. */
export function Hint({ children }: { children: ReactNode }) {
  return (
    <View style={styles.hint}>
      <AppText style={{ color: colors.accent, fontSize: 14, lineHeight: 20 }}>{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 6, borderRadius: 3 },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  counter: { fontFamily: fonts.display, fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: sizes.touchMin,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipSelected: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  chipLabel: { fontFamily: fonts.textMedium, fontSize: 15, color: colors.text },
  chipNote: { fontFamily: fonts.text, fontSize: 11, color: colors.textSecondary },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardCompact: { padding: spacing.md, borderRadius: 16, flex: 1 },
  cardSelected: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  segmentedItem: {
    flex: 1,
    minHeight: sizes.touchMin,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  segmentedLabel: { fontFamily: fonts.textBold, fontSize: 13, color: colors.text, textAlign: 'center' },
  hint: { backgroundColor: colors.accentBg, borderRadius: 16, padding: spacing.md },
});

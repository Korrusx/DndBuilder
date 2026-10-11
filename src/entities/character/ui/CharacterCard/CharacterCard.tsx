import { Pressable, StyleSheet, View } from 'react-native';

import { CREATE_STEPS } from '@/features/create-character/config/steps';
import { colors, fonts, radius, spacing } from '@/shared/config/theme';
import { content, tr } from '@/shared/content/content';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Button } from '@/shared/ui/Button/Button';
import { characterSummary, hpLevel } from '../../model/summary';
import type { Character } from '../../model/types';

type Props = {
  character: Character;
  onPress: () => void;
  onLongPress: () => void;
  /** Режим выбора для массового удаления: undefined — выключен. */
  selected?: boolean;
};

const HP_COLORS = { good: colors.heal, warn: colors.accent, danger: colors.damage } as const;

export function CharacterCard({ character: c, onPress, onLongPress, selected }: Props) {
  const selecting = selected !== undefined;
  const s = characterSummary(c, content);
  const draft = c.status.kind === 'draft' ? c.status : null;
  const subtitle = [s.classNames.map((n) => tr(n).text).join(' / '), tr(s.species).text, tr(s.background).text]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole={selecting ? 'checkbox' : 'button'}
      accessibilityState={selecting ? { checked: selected } : undefined}
      onPress={draft && !selecting ? undefined : onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && (!draft || selecting) && { opacity: 0.85 },
      ]}
    >
      <View style={styles.row}>
        {selecting ? (
          <View style={[styles.check, selected && styles.checkOn]}>
            {selected ? <AppText style={styles.checkMark}>✓</AppText> : null}
          </View>
        ) : (
          <View style={[styles.avatar, draft && styles.avatarDraft]}>
            <AppText style={[styles.avatarLetter, draft && { color: colors.textSecondary }]}>{s.letter}</AppText>
          </View>
        )}
        <View style={styles.info}>
          <AppText variant="heading" numberOfLines={1}>
            {c.name || 'Без имени'}
          </AppText>
          {subtitle ? (
            <AppText variant="secondary" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
          {c.campaign ? (
            <AppText variant="secondary" numberOfLines={1} style={{ color: colors.info }}>
              {c.campaign}
            </AppText>
          ) : null}
        </View>
        {s.level > 0 ? (
          <View style={styles.level}>
            <AppText style={styles.levelNumber}>{s.level}</AppText>
            <AppText style={styles.levelLabel}>ур.</AppText>
          </View>
        ) : null}
      </View>

      {s.hp ? (
        <View style={styles.row}>
          <View style={styles.hpBlock}>
            <View style={styles.hpTrack}>
              <View
                style={[
                  styles.hpFill,
                  {
                    width: `${s.hp.max > 0 ? (s.hp.current / s.hp.max) * 100 : 0}%`,
                    backgroundColor: HP_COLORS[hpLevel(s.hp.current, s.hp.max)],
                  },
                ]}
              />
            </View>
            <AppText variant="secondary">
              Хиты {s.hp.current} / {s.hp.max}
            </AppText>
          </View>
          {s.armorClass !== undefined ? (
            <View style={styles.ac}>
              <AppText style={styles.acNumber}>{s.armorClass}</AppText>
              <AppText style={styles.levelLabel}>КЗ</AppText>
            </View>
          ) : null}
        </View>
      ) : null}

      {draft ? (
        <View style={styles.draftRow}>
          <AppText variant="secondary" style={{ flex: 1 }}>
            Черновик · шаг {draft.step} из {CREATE_STEPS.length}
          </AppText>
          {selecting ? null : <Button title="Продолжить" variant="secondary" onPress={onPress} />}
        </View>
      ) : null}
    </Pressable>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDraft: { backgroundColor: colors.surface2 },
  cardSelected: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  check: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkMark: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.onAccent },
  avatarLetter: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.accent },
  info: { flex: 1, gap: 2 },
  level: { alignItems: 'center', minWidth: 40 },
  levelNumber: { fontFamily: fonts.displayBold, fontSize: 22, color: colors.text },
  levelLabel: { fontFamily: fonts.text, fontSize: 12, color: colors.textSecondary },
  hpBlock: { flex: 1, gap: spacing.xs },
  hpTrack: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, overflow: 'hidden' },
  hpFill: { height: '100%', borderRadius: 4 },
  ac: {
    alignItems: 'center',
    minWidth: 52,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.surface2,
  },
  acNumber: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.text },
  draftRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});

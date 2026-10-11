import { Pressable, View } from 'react-native';

import { CREATE_STEPS } from '@/features/create-character/config/steps';
import { colors } from '@/shared/config/theme';
import { content, tr } from '@/shared/content/content';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Button } from '@/shared/ui/Button/Button';
import { HP_COLORS } from '../../config/hpColors';
import { characterSummary, hpLevel } from '../../model/summary';
import { styles } from './CharacterCard.styles';
import type { CharacterCardProps } from './CharacterCard.types';

export function CharacterCard({ character: c, onPress, onLongPress, selected }: CharacterCardProps) {
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

import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '@/shared/config';
import { contentFor, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Badge, Button } from '@/shared/ui';

import { HP_COLORS } from '../../config/hpColors';
import { characterSummary, hpLevel } from '../../model/summary';
import { styles } from './CharacterCard.styles';
import type { CharacterCardProps } from './CharacterCard.types';

export function CharacterCard({ character: c, onPress, onLongPress, selected, draftSteps }: CharacterCardProps) {
  const { t } = useTranslation();
  const selecting = selected !== undefined;
  // Сводка считает лист персонажа — пересчитываем, только когда изменился сам персонаж.
  const s = useMemo(() => characterSummary(c, contentFor(c.edition)), [c]);
  const draft = c.status.kind === 'draft' ? c.status : null;
  // Один класс — просто название; мультикласс — с уровнями: «Плут 3 / Волшебник 2».
  const classes = s.classNames.map((n, i) => (s.classNames.length > 1 ? `${localizeText(n).text} ${s.classLevels[i]}` : localizeText(n).text)).join(' / ');
  const subtitle = [classes, localizeText(s.species).text, localizeText(s.background).text]
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
          {/* Редакция правил (5e24 / 5e14) — рядом с именем, чтобы её было видно и при длинной строке класса. */}
          <View style={styles.nameRow}>
            <AppText variant="heading" numberOfLines={1} style={styles.name}>
              {c.name || t('common.unnamed')}
            </AppText>
            <Badge label={`5e${c.edition.slice(2)}`} />
          </View>
          {subtitle ? (
            <AppText variant="secondary" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
          {c.campaign ? (
            <AppText variant="secondary" numberOfLines={1} style={styles.textInfo}>
              {c.campaign}
            </AppText>
          ) : null}
        </View>
        {s.level > 0 ? (
          <View style={styles.level}>
            <AppText style={styles.levelNumber}>{s.level}</AppText>
            <AppText style={styles.levelLabel}>{t('card.level')}</AppText>
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
              {t('card.hp', { current: s.hp.current, max: s.hp.max })}
            </AppText>
          </View>
          {s.armorClass !== undefined ? (
            <View style={styles.ac}>
              <AppText style={styles.acNumber}>{s.armorClass}</AppText>
              <AppText style={styles.levelLabel}>{t('card.ac')}</AppText>
            </View>
          ) : null}
        </View>
      ) : null}

      {draft ? (
        <View style={styles.draftRow}>
          <AppText variant="secondary" style={styles.fill}>
            {t('card.draft', { step: draft.step, total: draftSteps })}
          </AppText>
          {selecting ? null : <Button title={t('card.continue')} variant="secondary" onPress={onPress} />}
        </View>
      ) : null}
    </Pressable>
  );
}

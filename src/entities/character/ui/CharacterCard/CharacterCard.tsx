import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { contentFor } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, AvatarLetter, Badge, Button, HpBar } from '@/shared/ui';

import { HP_COLORS } from '../../config/hpColors';
import { characterSubtitle } from '../../lib/subtitle';
import { characterSummary, hpLevel } from '../../model/summary';
import { styles } from './CharacterCard.styles';
import type { CharacterCardProps } from './CharacterCard.types';

export function CharacterCard({ character, onPress, onLongPress, selected, draftSteps }: CharacterCardProps) {
  const { t } = useTranslation();
  const selecting = selected !== undefined;
  const s = useMemo(() => characterSummary(character, contentFor(character.edition)), [character]);
  const draft = character.status.kind === 'draft' ? character.status : null;
  const subtitle = characterSubtitle(character);

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
          <AvatarLetter letter={s.letter} dim={!!draft} />
        )}
        <View style={styles.info}>
          {/* Редакция правил (5e24 / 5e14) — рядом с именем, чтобы её было видно и при длинной строке класса. */}
          <View style={styles.nameRow}>
            <AppText variant="heading" numberOfLines={1} style={styles.name}>
              {character.name || t('common.unnamed')}
            </AppText>
            <Badge label={`5e${character.edition.slice(2)}`} />
          </View>
          {subtitle ? (
            <AppText variant="secondary" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
          {character.campaign ? (
            <AppText variant="secondary" numberOfLines={1} style={styles.textInfo}>
              {character.campaign}
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
            <HpBar
              current={s.hp.current}
              max={s.hp.max}
              color={HP_COLORS[hpLevel(s.hp.current, s.hp.max)]}
              height={8}
            />
            <AppText variant="secondary">{t('card.hp', { current: s.hp.current, max: s.hp.max })}</AppText>
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

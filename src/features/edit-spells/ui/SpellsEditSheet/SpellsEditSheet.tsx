import { View } from 'react-native';

import { spellLimits, spellOptions } from '@/entities/character';
import { content, spellName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, MultiPick, Section } from '@/shared/ui';

import { styles } from './SpellsEditSheet.styles';
import type { SpellsEditSheetProps } from './SpellsEditSheet.types';

export function SpellsEditSheet({
  visible,
  character: c,
  onChange,
  onClose,
}: SpellsEditSheetProps) {
  const { t } = useTranslation();
  const limits = spellLimits(c, content);
  if (!limits) return null;
  const circles = Array.from({ length: limits.maxSpellLevel }, (_, i) => i + 1);

  return (
    <BottomSheet visible={visible} title={t('spells.title')} onClose={onClose}>
      <AppText variant="secondary">
        {t('spells.editHint')}
      </AppText>
      {limits.cantrips > 0 ? (
        <Section title={t('spells.cantrips')} picked={c.cantrips.length} need={limits.cantrips}>
          <MultiPick
            options={spellOptions(limits.classId, 0, content)}
            selected={c.cantrips}
            max={limits.cantrips}
            label={spellName}
            onChange={(cantrips) => onChange({ cantrips, preparedSpells: c.preparedSpells })}
          />
        </Section>
      ) : null}
      <Section title={t('spells.prepared')} picked={c.preparedSpells.length} need={limits.prepared}>
        <View style={styles.gapMd}>
          {circles.map((circle) => {
            const options = spellOptions(limits.classId, circle, content);
            const inOptions = new Set(options);
            const inCircle = c.preparedSpells.filter((id) => inOptions.has(id));
            const others = c.preparedSpells.length - inCircle.length;
            return (
              <View key={circle} style={styles.gapSm}>
                <AppText variant="secondary">{t('spell.circle', { level: circle })}</AppText>
                <MultiPick
                  options={options}
                  selected={inCircle}
                  // Общий лимит на все круги: здесь можно выбрать столько, сколько осталось после других кругов.
                  max={Math.max(inCircle.length, limits.prepared - others)}
                  label={spellName}
                  onChange={(ids) =>
                    onChange({
                      cantrips: c.cantrips,
                      preparedSpells: [...c.preparedSpells.filter((id) => !inOptions.has(id)), ...ids],
                    })
                  }
                />
              </View>
            );
          })}
        </View>
      </Section>
    </BottomSheet>
  );
}

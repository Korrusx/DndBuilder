import { View } from 'react-native';

import {
  classSpellLists,
  hasSpellbook,
  preparableSpells,
  setClassSpellLists,
  setSpellbook,
  spellbook,
  spellbookMinimum,
  spellbookOptions,
  spellLimits,
  spellOptions,
} from '@/entities/character';
import { byId, content, spellName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, MultiPick, Section } from '@/shared/ui';

import { styles } from './SpellsEditSheet.styles';
import type { SpellsEditSheetProps } from './SpellsEditSheet.types';

export function SpellsEditSheet({ visible, character, classId, onChange, onClose }: SpellsEditSheetProps) {
  const { t } = useTranslation();
  const limits = spellLimits(character, content, classId);
  if (!limits) {
    return null;
  }
  const { cantrips, preparedSpells } = classSpellLists(character, content, limits.classId);
  const setLists = (patch: Parameters<typeof setClassSpellLists>[3]) =>
    onChange((d) => setClassSpellLists(d, content, limits.classId, patch));
  const circles = Array.from({ length: limits.maxSpellLevel }, (_, i) => i + 1);
  const book = spellbook(character);

  return (
    <BottomSheet visible={visible} title={t('spells.title')} onClose={onClose}>
      <AppText variant="secondary">{t('spells.editHint')}</AppText>
      {limits.cantrips > 0 ? (
        <Section title={t('spells.cantrips')} picked={cantrips.length} need={limits.cantrips}>
          <MultiPick
            options={spellOptions(limits.classId, 0, content)}
            selected={cantrips}
            max={limits.cantrips}
            label={spellName}
            onChange={(ids) => setLists({ cantrips: ids })}
          />
        </Section>
      ) : null}
      {limits.classId === 'wizard' && hasSpellbook(character) ? (
        <Section
          title={t('spells.spellbook')}
          hint={t('spells.spellbookHint')}
          picked={book.length}
          need={spellbookMinimum(character)}
        >
          <View style={styles.gapMd}>
            {circles.map((circle) => {
              const options = spellbookOptions(character, content, circle);
              const inOptions = new Set(options);
              return (
                <View key={circle} style={styles.gapSm}>
                  <AppText variant="secondary">{t('spell.circle', { level: circle })}</AppText>
                  <MultiPick
                    options={options}
                    selected={book.filter((id) => inOptions.has(id))}
                    max={options.length}
                    label={spellName}
                    onChange={(ids) =>
                      onChange((d) => setSpellbook(d, [...book.filter((id) => !inOptions.has(id)), ...ids], content))
                    }
                  />
                </View>
              );
            })}
          </View>
        </Section>
      ) : null}
      <Section
        title={
          byId.classes.get(limits.classId)?.spellcasting?.preparation === 'known'
            ? t('spells.known')
            : t('spells.prepared')
        }
        picked={preparedSpells.length}
        need={limits.prepared}
      >
        <View style={styles.gapMd}>
          {circles.map((circle) => {
            const options = preparableSpells(character, content, limits.classId, circle);
            const inOptions = new Set(options);
            const inCircle = preparedSpells.filter((id) => inOptions.has(id));
            const others = preparedSpells.length - inCircle.length;
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
                    setLists({ preparedSpells: [...preparedSpells.filter((id) => !inOptions.has(id)), ...ids] })
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

import { useState } from 'react';
import { View } from 'react-native';

import { characterResources, finishShortRest, shortRestResources, spendHitDie } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { content, nameOf, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDie, formatModifier, rollDie } from '@/shared/lib/dice';
import { AppText, BottomSheet, SmallButton } from '@/shared/ui';

import { styles } from './ShortRestSheet.styles';
import type { ShortRestSheetProps } from './ShortRestSheet.types';

export function ShortRestSheet({ visible, onClose }: ShortRestSheetProps) {
  const { character, sheet, updateState } = usePlay();
  const { t } = useTranslation();
  const [last, setLast] = useState<string | null>(null);
  const conMod = sheet.abilities.con.mod;
  const resources = characterResources(character, content, sheet);
  const restored = [
    ...((sheet.spellcasting?.slotsFromPact && character.state.slotsSpent.some(Boolean)) ||
    character.state.pactSlotsSpent?.some(Boolean)
      ? [t('rest.pactSlots')]
      : []),
    ...resources
      .filter((r) => r.spent > 0 && r.recovery !== 'long')
      .map((r) => `${localizeText(r.name).text}${r.recovery === 'short-one' && r.spent > 1 ? ' (1)' : ''}`),
  ];

  return (
    <BottomSheet
      visible={visible}
      title={t('rest.short')}
      onClose={() => {
        setLast(null);
        onClose();
      }}
    >
      <AppText variant="secondary">{t('rest.hitDiceHint')}</AppText>
      {sheet.hitDice.map((h) => {
        const left = h.total - (character.state.hitDiceSpent[h.classId] ?? 0);
        return (
          <View key={h.classId} style={styles.row}>
            <AppText style={styles.fill}>
              {t('rest.hitDiceLeft', {
                className: nameOf('classes', h.classId),
                left,
                total: h.total,
                die: formatDie(h.die),
              })}
            </AppText>
            <SmallButton
              title={t('rest.spend', { die: `${formatDie(h.die)}${conMod ? formatModifier(conMod) : ''}` })}
              tone="heal"
              disabled={left === 0 || character.state.currentHp >= sheet.maxHp}
              onPress={() => {
                const r = rollDie(h.die);
                setLast(
                  t('rest.rolled', {
                    roll: `${r}${conMod ? ` ${formatModifier(conMod)}` : ''}`,
                    count: Math.max(1, r + conMod),
                  }),
                );
                updateState((s) => spendHitDie(s, h.classId, h.total, r, conMod, sheet.maxHp));
              }}
            />
          </View>
        );
      })}
      {last ? <AppText style={styles.textHeal}>{last}</AppText> : null}
      <AppText variant="secondary">{t('rest.hp', { current: character.state.currentHp, max: sheet.maxHp })}</AppText>
      {restored.length ? (
        <AppText variant="secondary">{t('rest.restored', { list: restored.join(', ') })}</AppText>
      ) : null}
      <SmallButton
        title={t('rest.finish')}
        tone="accent"
        onPress={() => {
          updateState((s) =>
            shortRestResources(finishShortRest(s, sheet.spellcasting?.slotsFromPact ?? false), resources),
          );
          setLast(null);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

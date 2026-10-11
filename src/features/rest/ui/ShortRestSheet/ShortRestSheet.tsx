import { characterResources, finishShortRest, shortRestResources, spendHitDie } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { colors } from '@/shared/config';
import { content, nameOf, tr } from '@/shared/content';
import { formatModifier, rollDie } from '@/shared/lib/dice';
import { AppText, BottomSheet, SmallButton } from '@/shared/ui';
import { useState } from 'react';
import { View } from 'react-native';
import { styles } from './ShortRestSheet.styles';

export function ShortRestSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { character: c, sheet, updateState } = usePlay();
  const [last, setLast] = useState<string | null>(null);
  const conMod = sheet.abilities.con.mod;
  const resources = characterResources(c, content, sheet);
  const restored = [
    ...(sheet.spellcasting?.classId === 'warlock' && c.state.slotsSpent.some(Boolean) ? ['ячейки Магии договора'] : []),
    ...resources
      .filter((r) => r.spent > 0 && r.recovery !== 'long')
      .map((r) => `${tr(r.name).text}${r.recovery === 'short-one' && r.spent > 1 ? ' (1)' : ''}`),
  ];

  return (
    <BottomSheet
      visible={visible}
      title="Короткий отдых"
      onClose={() => {
        setLast(null);
        onClose();
      }}
    >
      <AppText variant="secondary">Можно потратить кости хитов: каждая восстанавливает бросок кости + мод. ТЕЛ (минимум 1).</AppText>
      {sheet.hitDice.map((h) => {
        const left = h.total - (c.state.hitDiceSpent[h.classId] ?? 0);
        return (
          <View key={h.classId} style={styles.row}>
            <AppText style={{ flex: 1 }}>
              {nameOf('classes', h.classId)}: {left} из {h.total} к{h.die}
            </AppText>
            <SmallButton
              title={`Потратить к${h.die}${conMod ? formatModifier(conMod) : ''}`}
              tone="heal"
              disabled={left === 0 || c.state.currentHp >= sheet.maxHp}
              onPress={() => {
                const r = rollDie(h.die);
                setLast(`Выпало ${r}${conMod ? ` ${formatModifier(conMod)}` : ''} → +${Math.max(1, r + conMod)} хитов`);
                updateState((s) => spendHitDie(s, h.classId, h.total, r, conMod, sheet.maxHp));
              }}
            />
          </View>
        );
      })}
      {last ? <AppText style={{ color: colors.heal }}>{last}</AppText> : null}
      <AppText variant="secondary">
        Хиты: {c.state.currentHp} / {sheet.maxHp}
      </AppText>
      {restored.length ? <AppText variant="secondary">После отдыха восстановится: {restored.join(', ')}.</AppText> : null}
      <SmallButton
        title="Завершить отдых"
        tone="accent"
        onPress={() => {
          updateState((s) => shortRestResources(finishShortRest(s, sheet.spellcasting?.classId === 'warlock'), resources));
          setLast(null);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

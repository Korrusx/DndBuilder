import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { usePlay } from '@/entities/character/model/CharacterContext';
import { addToInventory, toggleEquipped } from '@/entities/character/model/play';
import { AddItemSheet } from '@/features/add-item/ui/AddItemSheet';
import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { byId, content } from '@/shared/content/content';
import { itemName, nameOf } from '@/shared/content/names';
import type { Coin } from '@/shared/content/types';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Card } from '@/shared/ui/Card/Card';
import { Screen } from '@/shared/ui/Screen/Screen';
import { SmallButton } from '@/shared/ui/SmallButton/SmallButton';

const COINS: { id: Coin; label: string }[] = [
  { id: 'pp', label: 'Платиновые (пм)' },
  { id: 'gp', label: 'Золотые (зм)' },
  { id: 'ep', label: 'Электрум (эм)' },
  { id: 'sp', label: 'Серебряные (см)' },
  { id: 'cp', label: 'Медные (мм)' },
];

export function PlayItemsPage() {
  const { character: c, sheet, update } = usePlay();
  const [adding, setAdding] = useState(false);

  const setQuantity = (index: number, quantity: number) =>
    update((d) => ({
      ...d,
      equipment: quantity <= 0 ? d.equipment.filter((_, i) => i !== index) : d.equipment.map((it, i) => (i === index ? { ...it, quantity } : it)),
    }));

  return (
    <Screen>
      <AppText variant="secondary">КЗ сейчас: {sheet.armorClass}. Надетые доспех и щит учитываются в КЗ.</AppText>

      <SmallButton title="+ Добавить предмет" tone="accent" onPress={() => setAdding(true)} />
      {c.equipment.length === 0 ? <AppText variant="secondary">Снаряжения нет.</AppText> : null}
      <View style={styles.list}>
        {c.equipment.map((it, index) => {
          const item = byId.equipment.get(it.itemId);
          const wearable = !!item?.armor || !!item?.weapon;
          const contents = item?.contents?.map((x) => (x.count > 1 ? `${nameOf('equipment', x.id)} ×${x.count}` : nameOf('equipment', x.id)));
          return (
            <View key={`${it.itemId}-${index}`} style={[styles.row, index > 0 && styles.divider]}>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText>{itemName(it)}</AppText>
                {contents?.length ? (
                  <AppText variant="secondary" style={{ fontSize: 12 }}>
                    {contents.join(', ')}
                  </AppText>
                ) : null}
              </View>
              {wearable ? (
                <SmallButton
                  title={it.equipped ? (item?.armor ? 'Надето' : 'В руках') : item?.armor ? 'Надеть' : 'Взять'}
                  tone={it.equipped ? 'accent' : 'neutral'}
                  onPress={() => update((d) => ({ ...d, equipment: toggleEquipped(d.equipment, index, content) }))}
                />
              ) : null}
              <View style={styles.qty}>
                <SmallButton title="−" onPress={() => setQuantity(index, it.quantity - 1)} />
                <AppText style={styles.qtyValue}>{it.quantity}</AppText>
                <SmallButton title="+" onPress={() => setQuantity(index, it.quantity + 1)} />
              </View>
            </View>
          );
        })}
      </View>

      <Card>
        <AppText variant="heading">Монеты</AppText>
        {COINS.map((coin) => (
          <View key={coin.id} style={styles.coinRow}>
            <AppText style={{ flex: 1 }}>{coin.label}</AppText>
            <TextInput
              value={String(c.coins[coin.id] ?? 0)}
              onChangeText={(t) => {
                const n = parseInt(t.replace(/[^0-9]/g, ''), 10) || 0;
                update((d) => ({ ...d, coins: { ...d.coins, [coin.id]: n } }));
              }}
              keyboardType="number-pad"
              selectTextOnFocus
              style={styles.coinInput}
            />
          </View>
        ))}
      </Card>
      <AddItemSheet
        visible={adding}
        onClose={() => setAdding(false)}
        onAdd={(item) => update((d) => ({ ...d, equipment: addToInventory(d.equipment, item) }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyValue: { fontFamily: fonts.display, fontSize: 15, color: colors.text, minWidth: 26, textAlign: 'center' },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coinInput: {
    width: 96,
    minHeight: sizes.touchMin,
    borderRadius: 12,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 16,
    textAlign: 'right',
    paddingHorizontal: spacing.md,
  },
});

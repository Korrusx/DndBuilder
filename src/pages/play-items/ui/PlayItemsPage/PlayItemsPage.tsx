import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { addToInventory, toggleEquipped } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { AddItemSheet } from '@/features/add-item';
import { colors } from '@/shared/config';
import { byId, coinAbbr, coinName, COIN_ORDER, content, itemName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Card, GameIcon, Screen, Section, SmallButton } from '@/shared/ui';

import { itemCategory, itemIcon, type ItemCategory } from '../../lib/itemIcon';
import { ItemDetailSheet } from '../ItemDetailSheet/ItemDetailSheet';
import { CELL_SIZE, styles } from './PlayItemsPage.styles';

type FilterTab = 'all' | ItemCategory;

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
      <AppText style={[styles.filterText, active && styles.filterTextActive]}>{label}</AppText>
    </Pressable>
  );
}

export function PlayItemsPage() {
  const { character: c, sheet, update } = usePlay();
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selected, setSelected] = useState<number | null>(null);

  const setQuantity = (index: number, quantity: number) =>
    update((d) => ({
      ...d,
      equipment: quantity <= 0 ? d.equipment.filter((_, i) => i !== index) : d.equipment.map((it, i) => (i === index ? { ...it, quantity } : it)),
    }));

  const filtered = c.equipment
    .map((it, index) => ({ it, index }))
    .filter(({ it }) => {
      if (filter === 'all') return true;
      return itemCategory(byId.equipment.get(it.itemId)) === filter;
    });

  const equippedWeaponIdx = c.equipment.findIndex((it) => it.equipped && byId.equipment.get(it.itemId)?.weapon);
  const equippedShieldIdx = c.equipment.findIndex((it) => it.equipped && byId.equipment.get(it.itemId)?.armor?.category === 'shield');
  const equippedArmorIdx = c.equipment.findIndex(
    (it) => it.equipped && !!byId.equipment.get(it.itemId)?.armor && byId.equipment.get(it.itemId)?.armor?.category !== 'shield',
  );

  const selectedItem = selected !== null ? c.equipment[selected] : null;

  const slotData = [
    { key: 'weapon', label: t('inventory.slotWeapon'), idx: equippedWeaponIdx },
    { key: 'shield', label: t('inventory.slotShield'), idx: equippedShieldIdx },
    { key: 'armor', label: t('inventory.slotArmor'), idx: equippedArmorIdx },
  ] as const;

  return (
    <Screen>
      <View style={styles.acRow}>
        <View style={styles.acBadge}>
          <AppText style={styles.acText}>{t('inventory.acNow', { ac: sheet.armorClass })}</AppText>
        </View>
        <SmallButton title={t('inventory.add')} tone="accent" onPress={() => setAdding(true)} />
      </View>

      {/* Слоты экипировки */}
      <View style={styles.slotsRow}>
        {slotData.map((slot) => {
          const item = slot.idx >= 0 ? c.equipment[slot.idx] : undefined;
          const eq = item ? byId.equipment.get(item.itemId) : undefined;
          const filled = slot.idx >= 0;
          return (
            <Pressable
              key={slot.key}
              style={[styles.slot, filled ? styles.slotFilled : styles.slotEmpty]}
              onPress={filled ? () => setSelected(slot.idx) : undefined}
            >
              <GameIcon
                name={filled ? itemIcon(eq) : 'person'}
                size={28}
                color={filled ? colors.accent : colors.border}
              />
              {filled && item ? (
                <AppText style={styles.slotName} numberOfLines={2}>
                  {itemName(item)}{item.magicBonus ? ` +${item.magicBonus}` : ''}
                </AppText>
              ) : null}
              <AppText style={styles.slotLabel}>{slot.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Фильтр */}
      <View style={styles.filterRow}>
        {(['all', 'weapon', 'armor', 'other'] as FilterTab[]).map((f) => (
          <FilterChip
            key={f}
            active={filter === f}
            onPress={() => setFilter(f)}
            label={
              f === 'all' ? t('inventory.filterAll') :
              f === 'weapon' ? t('inventory.filterWeapons') :
              f === 'armor' ? t('inventory.filterArmor') :
              t('inventory.filterOther')
            }
          />
        ))}
      </View>

      {/* Сетка предметов */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="secondary">{t('inventory.empty')}</AppText>
        </View>
      ) : (
        <View style={styles.grid}>
          {filtered.map(({ it, index }) => {
            const eq = byId.equipment.get(it.itemId);
            const icon = itemIcon(eq);
            const name = itemName(it);
            return (
              <Pressable
                key={`${it.itemId}-${index}`}
                style={({ pressed }) => [styles.cell, it.equipped && styles.cellEquipped, pressed && { opacity: 0.75 }]}
                onPress={() => setSelected(index)}
              >
                <GameIcon
                  name={icon}
                  size={Math.floor(CELL_SIZE * 0.42)}
                  color={it.equipped ? colors.accent : colors.textSecondary}
                />
                <AppText style={styles.cellName} numberOfLines={2}>
                  {name}{it.magicBonus ? ` +${it.magicBonus}` : ''}
                </AppText>
                {it.quantity > 1 ? (
                  <View style={styles.cellQty}>
                    <AppText style={styles.cellQtyText}>{t('inventory.qtyBadge', { n: it.quantity })}</AppText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Монеты */}
      <Section title={t('inventory.coins')}>
        {[...COIN_ORDER].reverse().map((id) => (
          <View key={id} style={styles.coinRow}>
            <AppText style={styles.fill}>{t('inventory.coin', { name: coinName(id), abbr: coinAbbr(id) })}</AppText>
            <TextInput
              value={String(c.coins[id] ?? 0)}
              onChangeText={(text) => {
                const n = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                update((d) => ({ ...d, coins: { ...d.coins, [id]: n } }));
              }}
              keyboardType="number-pad"
              selectTextOnFocus
              style={styles.coinInput}
            />
          </View>
        ))}
      </Section>

      <AddItemSheet
        visible={adding}
        onClose={() => setAdding(false)}
        onAdd={(item) => update((d) => ({ ...d, equipment: addToInventory(d.equipment, item) }))}
      />

      <ItemDetailSheet
        item={selectedItem}
        index={selected ?? 0}
        onClose={() => setSelected(null)}
        onEquip={() => {
          if (selected === null) return;
          update((d) => ({ ...d, equipment: toggleEquipped(d.equipment, selected, content) }));
        }}
        onMagicBonus={() => {
          if (selected === null) return;
          update((d) => ({
            ...d,
            equipment: d.equipment.map((x, i) =>
              i === selected ? { ...x, magicBonus: ((x.magicBonus ?? 0) + 1) % 4 || undefined } : x,
            ),
          }));
        }}
        onQty={(qty) => {
          if (selected === null) return;
          if (qty <= 0) setSelected(null);
          setQuantity(selected, qty);
        }}
        onRemove={() => {
          if (selected === null) return;
          setSelected(null);
          update((d) => ({ ...d, equipment: d.equipment.filter((_, i) => i !== selected) }));
        }}
      />
    </Screen>
  );
}

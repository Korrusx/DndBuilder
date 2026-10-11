// Добавление предмета в инвентарь: поиск по снаряжению и магическим предметам или свой предмет.

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { content, tr } from '@/shared/content/content';
import { CUSTOM_ITEM_PREFIX, type InventoryItem } from '@/entities/character/model/character';
import { colors, fonts, radius, sizes, spacing } from '@/shared/config/theme';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Segmented } from '@/shared/ui/_split/wizard-ui';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';

type Source = 'equipment' | 'magic';

type Entry = { id: string; name: string; note: string };

const COIN: Record<string, string> = { cp: 'мм', sp: 'см', ep: 'эм', gp: 'зм', pp: 'пм' };

const EQUIPMENT: Entry[] = content.equipment
  .map((e) => ({ id: e.id, name: tr(e.name).text, note: `${e.cost.amount} ${COIN[e.cost.unit] ?? e.cost.unit}` }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

const MAGIC: Entry[] = content.magicItems
  .map((m) => ({ id: m.id, name: tr(m.name).text, note: tr(m.rarity).text }))
  .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

const MAX_RESULTS = 40;

export function AddItemSheet({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: InventoryItem) => void;
}) {
  const [source, setSource] = useState<Source>('equipment');
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<string | null>(null);

  const results = useMemo(() => {
    const list = source === 'equipment' ? EQUIPMENT : MAGIC;
    const q = query.trim().toLowerCase();
    return (q ? list.filter((e) => e.name.toLowerCase().includes(q)) : list).slice(0, MAX_RESULTS);
  }, [source, query]);

  const add = (item: InventoryItem, label: string) => {
    onAdd(item);
    setAdded(label);
  };

  const close = () => {
    setQuery('');
    setAdded(null);
    onClose();
  };

  const custom = query.trim();

  return (
    <BottomSheet visible={visible} title="Добавить предмет" onClose={close}>
      <Segmented<Source>
        value={source}
        onChange={setSource}
        options={[
          { value: 'equipment', label: 'Снаряжение' },
          { value: 'magic', label: 'Магические' },
        ]}
      />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Поиск или название своего предмета"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      {added ? <AppText style={{ color: colors.heal }}>Добавлено: {added}</AppText> : null}

      {custom ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => add({ itemId: `${CUSTOM_ITEM_PREFIX}${Date.now().toString(36)}`, quantity: 1, name: custom }, custom)}
          style={({ pressed }) => [styles.row, styles.customRow, pressed && { opacity: 0.8 }]}
        >
          <AppText style={{ flex: 1, color: colors.accent }}>+ Свой предмет «{custom}»</AppText>
        </Pressable>
      ) : null}

      <View style={styles.list}>
        {results.map((e, i) => (
          <Pressable
            key={e.id}
            accessibilityRole="button"
            onPress={() => add({ itemId: e.id, quantity: 1 }, e.name)}
            style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && { backgroundColor: colors.surface2 }]}
          >
            <AppText style={{ flex: 1 }}>{e.name}</AppText>
            <AppText variant="secondary" style={{ fontSize: 12 }}>
              {e.note}
            </AppText>
          </Pressable>
        ))}
        {results.length === 0 ? (
          <AppText variant="secondary" style={{ padding: spacing.md }}>
            Ничего не найдено. Можно добавить свой предмет кнопкой выше.
          </AppText>
        ) : null}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: sizes.touchMin,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: fonts.text,
    fontSize: 16,
  },
  list: { borderRadius: radius.card - 4, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: sizes.touchMin, paddingHorizontal: spacing.md },
  customRow: { borderRadius: 14, backgroundColor: colors.accentBg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
});

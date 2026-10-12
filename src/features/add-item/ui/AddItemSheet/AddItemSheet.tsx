import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import type { InventoryItem } from '@/entities/character';
import { CUSTOM_ITEM_PREFIX } from '@/entities/character';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, Segmented } from '@/shared/ui';

import { MAX_RESULTS } from '../../config/constants';
import { equipmentCatalog, magicCatalog } from '../../model/catalog';
import type { Source } from '../../model/types';
import { styles } from './AddItemSheet.styles';
import type { AddItemSheetProps } from './AddItemSheet.types';

export function AddItemSheet({
  visible,
  onClose,
  onAdd,
}: AddItemSheetProps) {
  const { t, i18n } = useTranslation();
  const [source, setSource] = useState<Source>('equipment');
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<string | null>(null);

  // Каталог строится один раз на язык: названия и сортировка зависят от языка.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const catalogs = useMemo(() => ({ equipment: equipmentCatalog(), magic: magicCatalog() }), [i18n.language]);
  const results = useMemo(() => {
    const list = catalogs[source];
    const q = query.trim().toLowerCase();
    return (q ? list.filter((e) => e.name.toLowerCase().includes(q)) : list).slice(0, MAX_RESULTS);
  }, [catalogs, source, query]);

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
    <BottomSheet visible={visible} title={t('items.add')} onClose={close}>
      <Segmented<Source>
        value={source}
        onChange={setSource}
        options={[
          { value: 'equipment', label: t('items.equipment') },
          { value: 'magic', label: t('items.magic') },
        ]}
      />
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('items.search')}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      {added ? <AppText style={styles.textHeal}>{t('items.added', { name: added })}</AppText> : null}

      {custom ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => add({ itemId: `${CUSTOM_ITEM_PREFIX}${Date.now().toString(36)}`, quantity: 1, name: custom }, custom)}
          style={({ pressed }) => [styles.row, styles.customRow, pressed && { opacity: 0.8 }]}
        >
          <AppText style={styles.customItem}>{t('items.custom', { name: custom })}</AppText>
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
            <AppText style={styles.fill}>{e.name}</AppText>
            <AppText variant="secondary" style={styles.size12}>
              {e.note}
            </AppText>
          </Pressable>
        ))}
        {results.length === 0 ? (
          <AppText variant="secondary" style={styles.padMd}>
            {t('items.nothing')}
          </AppText>
        ) : null}
      </View>
    </BottomSheet>
  );
}

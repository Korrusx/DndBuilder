import { useMemo, useState } from 'react';
import { Pressable, TextInput } from 'react-native';

import type { InventoryItem } from '@/entities/character';
import { equipmentEntries, magicItemEntries } from '@/entities/character';
import { colors } from '@/shared/config';
import { content } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, ChoiceList, Segmented } from '@/shared/ui';

import { MAX_RESULTS } from '../../config/constants';
import { equipmentCatalog, magicCatalog } from '../../model/catalog';
import { customItemId } from '../../model/customItemId';
import type { Source } from '../../model/types';
import { styles } from './AddItemSheet.styles';
import type { AddItemSheetProps } from './AddItemSheet.types';

export function AddItemSheet({ visible, onClose, onAdd }: AddItemSheetProps) {
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

  const entries = useMemo(() => {
    const ids = results.map((e) => e.id);
    return source === 'equipment' ? equipmentEntries(ids, content) : magicItemEntries(ids, content);
  }, [results, source]);

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
  const sourceOptions = [
    { value: 'equipment' as Source, label: t('items.equipment') },
    { value: 'magic' as Source, label: t('items.magic') },
  ];

  return (
    <BottomSheet visible={visible} title={t('items.add')} onClose={close}>
      <Segmented<Source> value={source} onChange={setSource} options={sourceOptions} />
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
          onPress={() => add({ itemId: customItemId(), quantity: 1, name: custom }, custom)}
          style={({ pressed }) => [styles.row, styles.customRow, pressed && { opacity: 0.8 }]}
        >
          <AppText style={styles.customItem}>{t('items.custom', { name: custom })}</AppText>
        </Pressable>
      ) : null}

      {results.length ? (
        <ChoiceList
          items={entries}
          selected={[]}
          max={0}
          detail={(id) => entries.find((entry) => entry.id === id)?.detail ?? null}
          onChange={() => {}}
          onAdd={(id) => add({ itemId: id, quantity: 1 }, entries.find((entry) => entry.id === id)?.title ?? id)}
        />
      ) : (
        <AppText variant="secondary" style={styles.padMd}>
          {t('items.nothing')}
        </AppText>
      )}
    </BottomSheet>
  );
}

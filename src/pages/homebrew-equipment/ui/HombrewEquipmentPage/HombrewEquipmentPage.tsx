import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useState } from 'react';

import type { HombrewEquipment } from '@/features/homebrew-equipment';
import { hombrewToEquipment, newHombrewId, useHombrewEquipment } from '@/features/homebrew-equipment';
import { coinAbbr, removeHombrewItem, updateHombrewItem } from '@/shared/content';
import { injectHomebrew } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, Button } from '@/shared/ui';

import { styles } from './HombrewEquipmentPage.styles';

type Coin = 'gp' | 'sp' | 'cp';
const COINS: Coin[] = ['gp', 'sp', 'cp'];

function emptyForm(): Omit<HombrewEquipment, 'id' | 'createdAt'> {
  return { nameRu: '', nameEn: '', descriptionRu: '', weight: null, costAmount: 0, costUnit: 'gp' };
}

export function HombrewEquipmentPage() {
  const { t } = useTranslation();
  const { items, save, remove } = useHombrewEquipment();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setSheetOpen(true);
  }

  function openEdit(item: HombrewEquipment) {
    setEditingId(item.id);
    setForm({
      nameRu: item.nameRu,
      nameEn: item.nameEn,
      descriptionRu: item.descriptionRu,
      weight: item.weight,
      costAmount: item.costAmount,
      costUnit: item.costUnit,
    });
    setSheetOpen(true);
  }

  async function handleSave() {
    if (!form.nameRu.trim()) return;
    const id = editingId ?? newHombrewId();
    const item: HombrewEquipment = {
      id,
      nameRu: form.nameRu.trim(),
      nameEn: form.nameEn.trim(),
      descriptionRu: form.descriptionRu.trim(),
      weight: form.weight,
      costAmount: form.costAmount,
      costUnit: form.costUnit,
      createdAt: editingId ? '' : new Date().toISOString(),
    };
    await save(item);
    const eq = hombrewToEquipment(item);
    if (editingId) {
      updateHombrewItem(eq);
    } else {
      injectHomebrew([eq]);
    }
    setSheetOpen(false);
  }

  function confirmDelete(item: HombrewEquipment) {
    Alert.alert(item.nameRu, t('homebrew.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await remove(item.id);
          removeHombrewItem(item.id);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {items.length === 0 ? (
          <AppText variant="secondary" style={styles.empty}>{t('homebrew.empty')}</AppText>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => openEdit(item)}
              accessibilityRole="button"
            >
              <View style={styles.rowMain}>
                <AppText style={styles.rowName}>{item.nameRu}</AppText>
                <AppText style={styles.rowSub}>
                  {item.costAmount} {coinAbbr(item.costUnit)}
                  {item.weight ? `  ·  ${item.weight} ф.` : ''}
                </AppText>
              </View>
              <Pressable
                style={styles.rowDelete}
                onPress={() => confirmDelete(item)}
                hitSlop={8}
                accessibilityLabel={t('common.delete')}
              >
                <AppText style={styles.rowDeleteText}>×</AppText>
              </Pressable>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={openCreate} accessibilityRole="button">
        <AppText style={styles.fabText}>+ {t('homebrew.create')}</AppText>
      </Pressable>

      <BottomSheet visible={sheetOpen} title={editingId ? t('homebrew.edit') : t('homebrew.create')} onClose={() => setSheetOpen(false)}>
        <AppText style={styles.formLabel}>{t('homebrew.nameRu')} *</AppText>
        <TextInput
          style={styles.formInput}
          value={form.nameRu}
          onChangeText={(v) => setForm((f) => ({ ...f, nameRu: v }))}
          placeholder={t('homebrew.namePlaceholder')}
          placeholderTextColor="#4A525D"
        />

        <AppText style={styles.formLabel}>{t('homebrew.nameEn')}</AppText>
        <TextInput
          style={styles.formInput}
          value={form.nameEn}
          onChangeText={(v) => setForm((f) => ({ ...f, nameEn: v }))}
          placeholder={t('homebrew.nameEnPlaceholder')}
          placeholderTextColor="#4A525D"
        />

        <View style={styles.formRow}>
          <View style={styles.formRowItem}>
            <AppText style={styles.formLabel}>{t('homebrew.cost')}</AppText>
            <TextInput
              style={styles.formInput}
              value={String(form.costAmount)}
              onChangeText={(v) => setForm((f) => ({ ...f, costAmount: parseInt(v.replace(/\D/g, ''), 10) || 0 }))}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.formRowItem}>
            <AppText style={styles.formLabel}>{t('homebrew.unit')}</AppText>
            <View style={styles.formSegRow}>
              {COINS.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.formUnitBtn, form.costUnit === c && styles.formUnitBtnActive]}
                  onPress={() => setForm((f) => ({ ...f, costUnit: c }))}
                >
                  <AppText style={[styles.formUnitText, form.costUnit === c && styles.formUnitTextActive]}>
                    {coinAbbr(c)}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <AppText style={styles.formLabel}>{t('homebrew.weight')}</AppText>
        <TextInput
          style={styles.formInput}
          value={form.weight !== null ? String(form.weight) : ''}
          onChangeText={(v) => setForm((f) => ({ ...f, weight: v ? parseFloat(v.replace(',', '.')) || null : null }))}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor="#4A525D"
        />

        <AppText style={styles.formLabel}>{t('homebrew.description')}</AppText>
        <TextInput
          style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
          value={form.descriptionRu}
          onChangeText={(v) => setForm((f) => ({ ...f, descriptionRu: v }))}
          multiline
          placeholder={t('homebrew.descriptionPlaceholder')}
          placeholderTextColor="#4A525D"
        />

        <View style={styles.formSave}>
          <Button title={t('common.done')} disabled={!form.nameRu.trim()} onPress={handleSave} />
        </View>
      </BottomSheet>
    </View>
  );
}

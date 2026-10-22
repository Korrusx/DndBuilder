import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useState } from 'react';

import type { HombrewArmorCategory, HombrewEquipment, HombrewItemKind, HombrewWeaponCategory, HombrewWeaponRangeType } from '@/features/homebrew-equipment';
import { hombrewToEquipment, newHombrewId, useHombrewEquipment } from '@/features/homebrew-equipment';
import { coinAbbr, injectHomebrew, removeHombrewItem, updateHombrewItem } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { colors } from '@/shared/config';
import { AppText, BottomSheet, Button } from '@/shared/ui';

import { styles } from './HombrewEquipmentPage.styles';

type Coin = 'gp' | 'sp' | 'cp';
const COINS: Coin[] = ['gp', 'sp', 'cp'];
const DAMAGE_DICE = ['1к4', '1к6', '1к8', '1к10', '1к12', '2к6'];
const DAMAGE_TYPES_RU = ['рубящий', 'колющий', 'дробящий', 'огнём', 'холодом', 'молнией'];
const MAGIC_BONUSES = [0, 1, 2, 3];

type FormState = Omit<HombrewEquipment, 'id' | 'createdAt'>;

function emptyForm(): FormState {
  return {
    nameRu: '', descriptionRu: '',
    weight: null, costAmount: 0, costUnit: 'gp',
    kind: 'gear',
    weaponDamageDice: '1к6', weaponDamageType: 'рубящий',
    weaponRangeType: 'melee', weaponCategory: 'simple',
    weaponIsLight: false, weaponIsTwoHanded: false, weaponIsFinesse: false, weaponIsThrown: false,
    additionalDamageDice: '', additionalDamageType: 'огнём',
    armorCategory: 'light', armorBase: 11, armorStealthDisadvantage: false,
    magicBonus: 0,
  };
}


function BtnGroup<T extends string>({
  value, options, onPress,
}: { value: T; options: { v: T; label: string }[]; onPress: (v: T) => void }) {
  return (
    <View style={styles.btnRow}>
      {options.map((o) => (
        <Pressable
          key={o.v}
          style={[styles.btn, value === o.v && styles.btnActive]}
          onPress={() => onPress(o.v)}
        >
          <AppText style={[styles.btnText, value === o.v && styles.btnTextActive]}>{o.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

function CheckBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.checkBtn, active && styles.checkBtnActive]} onPress={onPress}>
      <AppText style={[styles.checkText, active && styles.checkTextActive]}>{label}</AppText>
    </Pressable>
  );
}

export function HombrewEquipmentPage() {
  const { t } = useTranslation();
  const { items, save, remove } = useHombrewEquipment();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setSheetOpen(true);
  }

  function openEdit(item: HombrewEquipment) {
    setEditingId(item.id);
    const { id: _id, createdAt: _c, ...rest } = item;
    setForm(rest);
    setSheetOpen(true);
  }

  async function handleSave() {
    if (!form.nameRu.trim()) return;
    const id = editingId ?? newHombrewId();
    const item: HombrewEquipment = {
      ...form,
      id,
      nameRu: form.nameRu.trim(),
      descriptionRu: form.descriptionRu.trim(),
      createdAt: editingId ? '' : new Date().toISOString(),
    };
    await save(item);
    const eq = hombrewToEquipment(item);
    if (editingId) updateHombrewItem(eq);
    else injectHomebrew([eq]);
    setSheetOpen(false);
  }

  function confirmDelete(item: HombrewEquipment) {
    Alert.alert(item.nameRu, t('homebrew.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => { await remove(item.id); removeHombrewItem(item.id); },
      },
    ]);
  }

  const kindOptions: { v: HombrewItemKind; label: string }[] = [
    { v: 'gear', label: t('homebrew.kindGear') },
    { v: 'weapon', label: t('homebrew.kindWeapon') },
    { v: 'armor', label: t('homebrew.kindArmor') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        {items.length === 0 ? (
          <AppText variant="secondary" style={styles.empty}>{t('homebrew.empty')}</AppText>
        ) : (
          items.map((item) => (
            <Pressable key={item.id} style={styles.row} onPress={() => openEdit(item)} accessibilityRole="button">
              <View style={styles.rowMain}>
                <AppText style={styles.rowName}>{item.nameRu}</AppText>
                <AppText style={styles.rowSub}>
                  {item.kind === 'weapon'
                    ? [
                        `${item.weaponDamageDice}${item.magicBonus > 0 ? `+${item.magicBonus}` : ''} ${item.weaponDamageType}`,
                        item.additionalDamageDice ? `+ ${item.additionalDamageDice} ${item.additionalDamageType}` : '',
                      ].filter(Boolean).join(' ')
                    : item.kind === 'armor'
                    ? `${t(`homebrew.armorCat.${item.armorCategory}` as 'homebrew.armorCat.light')}${item.magicBonus > 0 ? ` +${item.magicBonus}` : ''}`
                    : `${item.costAmount} ${coinAbbr(item.costUnit)}`}
                </AppText>
              </View>
              <Pressable style={styles.rowDelete} onPress={() => confirmDelete(item)} hitSlop={8}>
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

        {/* Тип предмета */}
        <AppText style={styles.formLabel}>{t('homebrew.kind')}</AppText>
        <BtnGroup<HombrewItemKind> value={form.kind} options={kindOptions} onPress={(v) => set('kind', v)} />

        {/* Основные поля */}
        <AppText style={styles.formLabel}>{t('homebrew.name')} *</AppText>
        <TextInput style={styles.formInput} value={form.nameRu}
          onChangeText={(v) => set('nameRu', v)}
          placeholder={t('homebrew.namePlaceholder')} placeholderTextColor={colors.iconMuted} />

        <View style={styles.formRow}>
          <View style={styles.formRowItem}>
            <AppText style={styles.formLabel}>{t('homebrew.cost')}</AppText>
            <TextInput style={styles.formInput} value={String(form.costAmount)}
              onChangeText={(v) => set('costAmount', parseInt(v.replace(/\D/g, ''), 10) || 0)}
              keyboardType="number-pad" />
          </View>
          <View style={styles.formRowItem}>
            <AppText style={styles.formLabel}>{t('homebrew.unit')}</AppText>
            <View style={[styles.btnRow, styles.btnRowMt]}>
              {COINS.map((c) => (
                <Pressable key={c} style={[styles.btn, form.costUnit === c && styles.btnActive]}
                  onPress={() => set('costUnit', c)}>
                  <AppText style={[styles.btnText, form.costUnit === c && styles.btnTextActive]}>{coinAbbr(c)}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <AppText style={styles.formLabel}>{t('homebrew.weight')}</AppText>
        <TextInput style={styles.formInput}
          value={form.weight !== null ? String(form.weight) : ''}
          onChangeText={(v) => set('weight', v ? parseFloat(v.replace(',', '.')) || null : null)}
          keyboardType="decimal-pad" placeholder="—" placeholderTextColor={colors.iconMuted} />

        {/* Секция: оружие */}
        {form.kind === 'weapon' && (
          <>
            <AppText style={styles.formLabel}>{t('homebrew.weaponCategory')}</AppText>
            <BtnGroup<HombrewWeaponCategory>
              value={form.weaponCategory}
              options={[
                { v: 'simple', label: t('homebrew.weaponSimple') },
                { v: 'martial', label: t('homebrew.weaponMartial') },
              ]}
              onPress={(v) => set('weaponCategory', v)}
            />

            <AppText style={styles.formLabel}>{t('homebrew.weaponRangeType')}</AppText>
            <BtnGroup<HombrewWeaponRangeType>
              value={form.weaponRangeType}
              options={[
                { v: 'melee', label: t('homebrew.weaponMelee') },
                { v: 'ranged', label: t('homebrew.weaponRanged') },
              ]}
              onPress={(v) => set('weaponRangeType', v)}
            />

            <AppText style={styles.formLabel}>{t('homebrew.weaponDamageDice')}</AppText>
            <View style={styles.diceRow}>
              {DAMAGE_DICE.map((d) => (
                <Pressable key={d} style={[styles.diceBtn, form.weaponDamageDice === d && styles.diceBtnActive]}
                  onPress={() => set('weaponDamageDice', d)}>
                  <AppText style={[styles.diceText, form.weaponDamageDice === d && styles.diceTextActive]}>{d}</AppText>
                </Pressable>
              ))}
            </View>

            <AppText style={styles.formLabel}>{t('homebrew.weaponDamageType')}</AppText>
            <View style={styles.diceRow}>
              {DAMAGE_TYPES_RU.map((d) => (
                <Pressable key={d} style={[styles.diceBtn, form.weaponDamageType === d && styles.diceBtnActive]}
                  onPress={() => set('weaponDamageType', d)}>
                  <AppText style={[styles.diceText, form.weaponDamageType === d && styles.diceTextActive]}>{d}</AppText>
                </Pressable>
              ))}
            </View>

            <AppText style={styles.formLabel}>{t('homebrew.weaponProps')}</AppText>
            <View style={styles.checkGrid}>
              <CheckBtn label={t('homebrew.propLight')} active={form.weaponIsLight} onPress={() => set('weaponIsLight', !form.weaponIsLight)} />
              <CheckBtn label={t('homebrew.propTwoHanded')} active={form.weaponIsTwoHanded} onPress={() => set('weaponIsTwoHanded', !form.weaponIsTwoHanded)} />
              <CheckBtn label={t('homebrew.propFinesse')} active={form.weaponIsFinesse} onPress={() => set('weaponIsFinesse', !form.weaponIsFinesse)} />
              {form.weaponRangeType === 'melee' && (
                <CheckBtn label={t('homebrew.propThrown')} active={form.weaponIsThrown} onPress={() => set('weaponIsThrown', !form.weaponIsThrown)} />
              )}
            </View>

            <AppText style={styles.formLabel}>{t('homebrew.magicBonus')}</AppText>
            <View style={styles.btnRow}>
              {MAGIC_BONUSES.map((n) => (
                <Pressable key={n} style={[styles.btn, form.magicBonus === n && styles.btnActive]}
                  onPress={() => set('magicBonus', n)}>
                  <AppText style={[styles.btnText, form.magicBonus === n && styles.btnTextActive]}>
                    {n === 0 ? '—' : `+${n}`}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <AppText style={styles.formLabel}>{t('homebrew.additionalDamage')}</AppText>
            <View style={styles.formRow}>
              <View style={styles.formRowItem}>
                <AppText style={styles.formLabel}>{t('homebrew.additionalDamageDice')}</AppText>
                <View style={styles.diceRow}>
                  <Pressable
                    style={[styles.diceBtn, form.additionalDamageDice === '' && styles.diceBtnActive]}
                    onPress={() => set('additionalDamageDice', '')}>
                    <AppText style={[styles.diceText, form.additionalDamageDice === '' && styles.diceTextActive]}>—</AppText>
                  </Pressable>
                  {DAMAGE_DICE.map((d) => (
                    <Pressable key={d} style={[styles.diceBtn, form.additionalDamageDice === d && styles.diceBtnActive]}
                      onPress={() => set('additionalDamageDice', d)}>
                      <AppText style={[styles.diceText, form.additionalDamageDice === d && styles.diceTextActive]}>{d}</AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
            {form.additionalDamageDice !== '' && (
              <>
                <AppText style={styles.formLabel}>{t('homebrew.additionalDamageType')}</AppText>
                <View style={styles.diceRow}>
                  {DAMAGE_TYPES_RU.map((d) => (
                    <Pressable key={d} style={[styles.diceBtn, form.additionalDamageType === d && styles.diceBtnActive]}
                      onPress={() => set('additionalDamageType', d)}>
                      <AppText style={[styles.diceText, form.additionalDamageType === d && styles.diceTextActive]}>{d}</AppText>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* Секция: броня */}
        {form.kind === 'armor' && (
          <>
            <AppText style={styles.formLabel}>{t('homebrew.armorKind')}</AppText>
            <BtnGroup<HombrewArmorCategory>
              value={form.armorCategory}
              options={[
                { v: 'light', label: t('homebrew.armorCat.light') },
                { v: 'medium', label: t('homebrew.armorCat.medium') },
                { v: 'heavy', label: t('homebrew.armorCat.heavy') },
                { v: 'shield', label: t('homebrew.armorCat.shield') },
              ]}
              onPress={(v) => set('armorCategory', v)}
            />

            {form.armorCategory !== 'shield' && (
              <>
                <AppText style={styles.formLabel}>{t('homebrew.armorBase')}</AppText>
                <TextInput style={styles.formInput}
                  value={String(form.armorBase)}
                  onChangeText={(v) => set('armorBase', parseInt(v.replace(/\D/g, ''), 10) || 0)}
                  keyboardType="number-pad" />
                <AppText style={[styles.formLabel, styles.formLabelSm]}>
                  {form.armorCategory === 'light' ? t('homebrew.armorHintLight')
                    : form.armorCategory === 'medium' ? t('homebrew.armorHintMedium')
                    : t('homebrew.armorHintHeavy')}
                </AppText>
              </>
            )}

            <AppText style={styles.formLabel}>{t('homebrew.armorStealth')}</AppText>
            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, form.armorStealthDisadvantage && styles.btnActive]}
                onPress={() => set('armorStealthDisadvantage', !form.armorStealthDisadvantage)}>
                <AppText style={[styles.btnText, form.armorStealthDisadvantage && styles.btnTextActive]}>
                  {form.armorStealthDisadvantage ? t('homebrew.armorStealthYes') : t('homebrew.armorStealthNo')}
                </AppText>
              </Pressable>
            </View>

            <AppText style={styles.formLabel}>{t('homebrew.magicBonus')}</AppText>
            <View style={styles.btnRow}>
              {MAGIC_BONUSES.map((n) => (
                <Pressable key={n} style={[styles.btn, form.magicBonus === n && styles.btnActive]}
                  onPress={() => set('magicBonus', n)}>
                  <AppText style={[styles.btnText, form.magicBonus === n && styles.btnTextActive]}>
                    {n === 0 ? '—' : `+${n}`}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <AppText style={styles.formLabel}>{t('homebrew.description')}</AppText>
        <TextInput style={[styles.formInput, styles.formInputMultiline]}
          value={form.descriptionRu} onChangeText={(v) => set('descriptionRu', v)}
          multiline placeholder={t('homebrew.descriptionPlaceholder')} placeholderTextColor={colors.iconMuted} />

        <View style={styles.formSave}>
          <Button title={t('common.done')} disabled={!form.nameRu.trim()} onPress={handleSave} />
        </View>
      </BottomSheet>
    </View>
  );
}

import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { addToInventory, computeSheet, equipToSlot, fitsSlot, unequipSlot } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import type { Character, SlotId } from '@/entities/character';
import { AddItemSheet } from '@/features/add-item';
import { byId, coinAbbr, coinName, COIN_ORDER, contentFor, itemName, plain, tr } from '@/shared/content';
import type { Equipment, MagicItem } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, Card, GameIcon, Section } from '@/shared/ui';

import { itemIcon, SLOT_ICONS } from '../../lib/itemIcon';
import { DOLL_H, SCALE, SLOT_SIZE, styles, W } from './PlayItemsPage.styles';

type SlotDef = {
  id: SlotId;
  col: 0 | 1;
  row: number;
  pt: [number, number];
  labelRu: string;
  labelEn: string;
};
type WeaponSlotDef = { id: SlotId; labelRu: string; labelEn: string };

const BODY_SLOTS: SlotDef[] = [
  { id: 'head',      col: 0, row: 0, pt: [172,  90], labelRu: 'Голова',    labelEn: 'Head' },
  { id: 'shoulders', col: 0, row: 1, pt: [160, 140], labelRu: 'Плечи',     labelEn: 'Shoulders' },
  { id: 'body',      col: 0, row: 2, pt: [180, 190], labelRu: 'Тело',      labelEn: 'Body' },
  { id: 'hands',     col: 0, row: 3, pt: [134, 266], labelRu: 'Руки',      labelEn: 'Hands' },
  { id: 'feet',      col: 0, row: 4, pt: [168, 372], labelRu: 'Ноги',      labelEn: 'Feet' },
  { id: 'neck',      col: 1, row: 0, pt: [198, 118], labelRu: 'Шея',       labelEn: 'Neck' },
  { id: 'wrists',    col: 1, row: 1, pt: [252, 226], labelRu: 'Запястья',  labelEn: 'Wrists' },
  { id: 'belt',      col: 1, row: 2, pt: [212, 236], labelRu: 'Пояс',      labelEn: 'Belt' },
  { id: 'ring1',     col: 1, row: 3, pt: [257, 266], labelRu: 'Кольцо',    labelEn: 'Ring' },
  { id: 'ring2',     col: 1, row: 4, pt: [257, 272], labelRu: 'Кольцо',    labelEn: 'Ring' },
];

const WEAPON_SLOTS: WeaponSlotDef[] = [
  { id: 'main',   labelRu: 'Основная рука', labelEn: 'Main Hand' },
  { id: 'off',    labelRu: 'Вторая рука',   labelEn: 'Off Hand' },
  { id: 'ranged', labelRu: 'Дальний бой',   labelEn: 'Ranged' },
];

const ALL_SLOT_DEFS: (SlotDef | WeaponSlotDef)[] = [...BODY_SLOTS, ...WEAPON_SLOTS];
const ALL_SLOT_IDS = ALL_SLOT_DEFS.map((d) => d.id);

const RARITY_COLORS: Record<string, string> = {
  uncommon: '#6FD69A',
  rare: '#8FB8FF',
  'very rare': '#C9A0FF',
  legendary: '#FF9F5A',
};

function rarityColor(rarity: string | undefined): string {
  if (!rarity) return '#4A525D';
  return RARITY_COLORS[rarity.toLowerCase()] ?? '#4A525D';
}

function lookupItem(itemId: string): Equipment | MagicItem | undefined {
  return (byId.equipment.get(itemId) as Equipment | undefined) ?? (byId.magicItems.get(itemId) as MagicItem | undefined);
}

function isMagicItem(item: Equipment | MagicItem): item is MagicItem {
  return 'attunement' in item;
}

function isTwoHandedWeapon(itemId: string): boolean {
  const item = lookupItem(itemId) as Equipment | undefined;
  return !!item?.weapon?.properties?.includes('two-handed');
}

function allSlotsForItem(item: Equipment | MagicItem): SlotId[] {
  return ALL_SLOT_IDS.filter((s) => fitsSlot(item, s));
}

function countAttuned(equippedSlots: Partial<Record<string, string>>): number {
  return Object.values(equippedSlots).filter((id) => {
    if (!id) return false;
    const item = lookupItem(id);
    return item ? isMagicItem(item) && item.attunement : false;
  }).length;
}

function fmtHit(n: number): string {
  return (n >= 0 ? '+' : '') + n;
}

function deltaStyle(delta: number) {
  return delta > 0 ? styles.deltaUp : delta < 0 ? styles.deltaDown : styles.deltaEq;
}

function fmtDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : '±0';
}

export function PlayItemsPage() {
  const { character, sheet, update } = usePlay();
  const { t, i18n } = useTranslation();
  const isRu = i18n.language === 'ru';

  function slotLabel(def: SlotDef | WeaponSlotDef): string {
    return isRu ? def.labelRu : def.labelEn;
  }

  const [selectedSlot, setSelectedSlot] = useState<SlotId>('body');
  const [bagOpen, setBagOpen] = useState(false);
  const [bagExpandedItem, setBagExpandedItem] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const equippedSlots = character.equippedSlots ?? {};
  const bag = character.equipment;
  const attuned = useMemo(() => countAttuned(equippedSlots), [equippedSlots]);

  const mainIsTwoHanded = useMemo(() => {
    const mid = equippedSlots.main;
    return mid ? isTwoHandedWeapon(mid) : false;
  }, [equippedSlots]);

  function calcHypoAc(slotId: SlotId, itemId: string | null): number {
    const slots = itemId
      ? { ...equippedSlots, [slotId]: itemId }
      : (() => { const { [slotId]: _r, ...rest } = equippedSlots; return rest; })();
    try {
      const hypo: Character = { ...character, equippedSlots: slots };
      return computeSheet(hypo, contentFor(character.edition)).armorClass;
    } catch {
      return sheet.armorClass;
    }
  }

  function removeOneFromBag(itemId: string, qty: number) {
    const name = itemName({ itemId });
    const msg = qty > 1
      ? t('inventory.confirmRemoveQty', { name, qty })
      : t('inventory.confirmRemove', { name });
    Alert.alert(name, msg, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('inventory.remove'),
        style: 'destructive',
        onPress: () =>
          update((c) => ({
            ...c,
            equipment: c.equipment
              .map((x) => x.itemId === itemId ? { ...x, quantity: x.quantity - 1 } : x)
              .filter((x) => x.quantity > 0),
          })),
      },
    ]);
  }

  function doEquip(slotId: SlotId, itemId: string | null) {
    if (itemId) {
      update((c: Character) => {
        let next = equipToSlot(c, slotId, itemId);
        // Двуручное оружие в основной руке освобождает вторую
        if (slotId === 'main' && isTwoHandedWeapon(itemId)) {
          next = unequipSlot(next, 'off');
        }
        return next;
      });
    } else {
      update((c: Character) => unequipSlot(c, slotId));
    }
    setBagOpen(false);
    setBagExpandedItem(null);
  }

  const candidates: { inv: typeof bag[number]; item: Equipment | MagicItem }[] = useMemo(() => {
    // Вторая рука недоступна, если в основной — двуручное
    if (selectedSlot === 'off' && mainIsTwoHanded) return [];
    return bag
      .map((inv) => ({ inv, item: lookupItem(inv.itemId) }))
      .filter((x): x is { inv: typeof bag[number]; item: Equipment | MagicItem } => {
        return !!x.item && fitsSlot(x.item, selectedSlot);
      });
  }, [bag, selectedSlot, mainIsTwoHanded]);

  const selectedItemId = equippedSlots[selectedSlot] ?? null;
  const selectedItem = selectedItemId ? lookupItem(selectedItemId) : undefined;
  const currentAc = sheet.armorClass;

  // ---------- Ячейки куклы ----------

  const bodySlotViews = BODY_SLOTS.map((s) => {
    const rawLeft = s.col === 0 ? 14 : 322;
    const rawTop = 22 + s.row * 76;
    const itemId = equippedSlots[s.id] ?? null;
    const item = itemId ? lookupItem(itemId) : undefined;
    const on = selectedSlot === s.id;
    const rarColor = item && isMagicItem(item) ? rarityColor(tr(item.rarity).text) : '#4A525D';
    const iconColor = itemId ? (rarColor === '#4A525D' ? '#C9C3B8' : rarColor) : '#4a525d';

    return (
      <Pressable
        key={s.id}
        style={[
          styles.slot,
          itemId ? styles.slotFilled : null,
          on ? styles.slotSelected : null,
          { left: Math.round(rawLeft * SCALE), top: Math.round(rawTop * SCALE) },
          itemId && rarColor !== '#4A525D' ? { borderColor: rarColor } : null,
        ]}
        onPress={() => setSelectedSlot(s.id)}
        accessibilityLabel={slotLabel(s)}
        hitSlop={4}
      >
        <GameIcon
          name={item ? itemIcon(item) : SLOT_ICONS[s.id]}
          size={Math.round(24 * SCALE)}
          color={iconColor}
        />
        {item && isMagicItem(item) && item.attunement ? <View style={styles.slotAttuned} /> : null}
      </Pressable>
    );
  });

  const weaponSlotViews = WEAPON_SLOTS.map((w) => {
    const itemId = equippedSlots[w.id] ?? null;
    const item = itemId ? lookupItem(itemId) : undefined;
    const on = selectedSlot === w.id;
    const eq2 = item as Equipment | undefined;

    let stat = '';
    if (itemId && eq2?.weapon) {
      const atk = sheet.attacks.find((a) => a.itemId === itemId);
      if (atk) stat = `${fmtHit(atk.toHit)} · ${atk.damageDice}`;
    } else if (itemId && eq2?.armor?.category === 'shield') {
      stat = 'КЗ +2';
    }

    return (
      <Pressable
        key={w.id}
        style={[
          styles.weaponSlot,
          itemId ? styles.weaponSlotFilled : null,
          on ? styles.weaponSlotSelected : null,
        ]}
        onPress={() => setSelectedSlot(w.id)}
      >
        <GameIcon
          name={item ? itemIcon(item) : SLOT_ICONS[w.id]}
          size={20}
          color={itemId ? '#c9c3b8' : '#4a525d'}
        />
        <View style={styles.weaponSlotText}>
          {itemId ? (
            <>
              <AppText style={styles.weaponSlotName} numberOfLines={2}>
                {itemName({ itemId })}
              </AppText>
              {!!stat && <AppText style={styles.weaponSlotStat}>{stat}</AppText>}
            </>
          ) : (
            <>
              <AppText style={styles.weaponSlotName}>{slotLabel(w)}</AppText>
              <AppText style={styles.weaponSlotEmpty}>{t('inventory.slotEmpty').toLowerCase()}</AppText>
            </>
          )}
        </View>
      </Pressable>
    );
  });

  // ---------- SVG линии выносок ----------

  const lineViews = BODY_SLOTS.map((s) => {
    const rawLeft = s.col === 0 ? 14 : 322;
    const rawTop = 22 + s.row * 76;
    const anchorX = s.col === 0 ? (rawLeft + 54) * SCALE : rawLeft * SCALE;
    const anchorY = (rawTop + 27) * SCALE;
    const bodyX = s.pt[0] * SCALE;
    const bodyY = s.pt[1] * SCALE;
    const itemId = equippedSlots[s.id];
    const on = selectedSlot === s.id;
    const color = on ? '#f2b14a' : itemId ? '#4a525d' : '#2c323b';
    const strokeWidth = on ? 2 * SCALE : 1.2 * SCALE;
    const dashArr = (!itemId && !on) ? `${3 * SCALE} ${4 * SCALE}` : undefined;

    return (
      <React.Fragment key={s.id}>
        <Line
          x1={anchorX} y1={anchorY}
          x2={bodyX} y2={bodyY}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArr}
        />
        <Circle cx={bodyX} cy={bodyY} r={3 * SCALE} fill={color} />
      </React.Fragment>
    );
  });

  // ---------- Карточка выбранного слота ----------

  const selDef = ALL_SLOT_DEFS.find((s) => s.id === selectedSlot);
  const selLabel = selDef ? slotLabel(selDef) : selectedSlot;

  let cardContent: React.ReactNode;
  if (!selectedItem || !selectedItemId) {
    cardContent = (
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <GameIcon name={SLOT_ICONS[selectedSlot]} size={24} color="#4a525d" />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={styles.cardTitle}>{t('inventory.slotEmpty')}</AppText>
          <AppText style={styles.cardTag}>{selLabel}</AppText>
        </View>
      </View>
    );
  } else {
    const eq2 = selectedItem as Equipment;
    const magic = selectedItem as MagicItem;
    const icon = itemIcon(selectedItem);
    const rarColor = isMagicItem(selectedItem) ? rarityColor(tr(magic.rarity).text) : '#4A525D';
    const iconColor = rarColor === '#4A525D' ? '#C9C3B8' : rarColor;

    let tag = '';
    if (eq2.weapon) {
      tag = eq2.weapon.damage?.type ?? '';
    } else if (eq2.armor) {
      const cat = eq2.armor.category;
      if (cat === 'shield') tag = t('inventory.acShield');
      else if (cat === 'light') tag = t('inventory.acLight', { base: eq2.armor.base });
      else if (cat === 'medium') tag = t('inventory.acMedium', { base: eq2.armor.base });
      else tag = t('inventory.acHeavy', { base: eq2.armor.base });
    } else if (isMagicItem(selectedItem)) {
      tag = tr(magic.rarity).text;
    }

    const atk = sheet.attacks.find((a) => a.itemId === selectedItemId);
    const atkLine = atk ? `${fmtHit(atk.toHit)} · ${atk.damageDice}` : '';
    const descSrc = eq2.description ?? (isMagicItem(selectedItem) ? magic.description : undefined);
    const descText = plain(descSrc);

    cardContent = (
      <>
        <View style={styles.cardTop}>
          <View style={[styles.cardIcon, { borderColor: rarColor }]}>
            <GameIcon name={icon} size={24} color={iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={styles.cardTitle} numberOfLines={1}>
              {itemName({ itemId: selectedItemId })}
            </AppText>
            <AppText style={styles.cardTag}>{tag}</AppText>
          </View>
          {isMagicItem(selectedItem) && magic.attunement ? <View style={styles.slotAttuned} /> : null}
        </View>
        {!!atkLine && <AppText style={styles.cardAtk}>{atkLine}</AppText>}
        {!!descText && <AppText style={styles.cardDesc} numberOfLines={2}>{descText}</AppText>}
        <Pressable style={styles.cardBtn} onPress={() => doEquip(selectedSlot, null)}>
          <AppText style={styles.cardBtnText}>{t('inventory.unequip')}</AppText>
        </Pressable>
      </>
    );
  }

  // ---------- Инлайн-кандидаты ----------

  const candidatesSection: React.ReactNode = (() => {
    if (selectedSlot === 'off' && mainIsTwoHanded) {
      return (
        <AppText style={styles.twoHandedWarn}>{t('inventory.twoHandedBlocked')}</AppText>
      );
    }
    if (candidates.length === 0) {
      return (
        <View style={styles.candidatesSection}>
          <AppText style={styles.emptyText}>{t('inventory.noOptions')}</AppText>
        </View>
      );
    }
    return (
      <View style={styles.candidatesSection}>
        <AppText style={styles.candidatesTitle}>{t('inventory.candidatesHeader')}</AppText>
        {candidates.map(({ inv, item }) => {
          const id = inv.itemId;
          const newAc = calcHypoAc(selectedSlot, id);
          const delta = newAc - currentAc;
          const willClearOff = selectedSlot === 'main' && isTwoHandedWeapon(id) && !!equippedSlots.off;
          const needsAttune = isMagicItem(item) && item.attunement;
          const attuneFull = needsAttune && attuned >= 3 && equippedSlots[selectedSlot] !== id;
          const eq = item as Equipment;
          const isWeapon = !!eq.weapon;
          const dmgDice = isWeapon ? (eq.weapon!.damage?.dice ?? null) : null;

          return (
            <Pressable
              key={id}
              style={[styles.opt, attuneFull ? styles.optDisabled : null]}
              onPress={() => { if (!attuneFull) doEquip(selectedSlot, id); }}
              disabled={attuneFull}
            >
              <GameIcon name={itemIcon(item)} size={32} color="#c9c3b8" />
              <View style={styles.optMid}>
                <AppText style={styles.optName}>{itemName({ itemId: id })}</AppText>
                {willClearOff && (
                  <AppText style={styles.optSub}>{t('inventory.willClearOff')}</AppText>
                )}
                {needsAttune && !attuneFull && (
                  <AppText style={styles.optSub}>{t('inventory.attunement')}</AppText>
                )}
                {attuneFull && (
                  <AppText style={styles.optWarn}>{t('inventory.noAttunement')}</AppText>
                )}
              </View>
              {isWeapon ? (
                <View style={styles.optRight}>
                  {dmgDice && <AppText style={styles.optAcVal}>{dmgDice}</AppText>}
                </View>
              ) : (
                <View style={styles.optRight}>
                  <AppText style={styles.optAcVal}>{newAc}</AppText>
                  <AppText style={[styles.delta, deltaStyle(delta)]}>{fmtDelta(delta)}</AppText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  })();

  // ---------- Рендер ----------

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText style={styles.title}>{t('inventory.title')}</AppText>
          <AppText style={styles.summary}>
            КЗ {currentAc} · настройка {attuned}/3
          </AppText>
        </View>
        <Pressable style={styles.bagBtn} onPress={() => { setBagExpandedItem(null); setBagOpen(true); }}>
          <GameIcon name="person" size={18} color="#9aa3ae" />
          <AppText style={styles.bagBtnText}>
            {t('inventory.bag')} · {bag.length}
          </AppText>
        </Pressable>
      </View>

      {/* Кукла + карточка + кандидаты */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        {/* Кукла */}
        <View style={styles.doll}>
          <View style={styles.halo} />

          {/* Силуэт персонажа */}
          <Svg
            width={Math.round(176 * SCALE)}
            height={Math.round(352 * SCALE)}
            viewBox="0 0 160 320"
            style={{
              position: 'absolute',
              left: Math.round(107 * SCALE),
              top: Math.round(50 * SCALE),
            }}
          >
            <Path
              d="M50 74 Q80 64 110 74 L132 250 Q80 266 28 250 Z"
              fill={equippedSlots.shoulders ? '#2b2416' : 'transparent'}
              opacity={0.9}
            />
            <Path d="M47 82 Q32 100 28 140 L24 196 M113 82 Q128 100 132 140 L136 196" stroke="#3a414b" strokeWidth={20} strokeLinecap="round" fill="none" />
            <Path d="M47 82 Q32 100 28 140 L24 196 M113 82 Q128 100 132 140 L136 196" stroke="#1d2127" strokeWidth={16} strokeLinecap="round" fill="none" />
            <Path d="M60 172 L56 302 M100 172 L104 302" stroke="#3a414b" strokeWidth={26} strokeLinecap="round" fill="none" />
            <Path d="M60 172 L56 302 M100 172 L104 302" stroke="#1d2127" strokeWidth={22} strokeLinecap="round" fill="none" />
            <Path
              d="M50 76 Q80 68 110 76 L116 172 Q80 182 44 172 Z"
              fill="#1d2127"
              stroke={equippedSlots.body ? 'rgba(242,177,74,.55)' : '#3a414b'}
              strokeWidth={2}
            />
            <Rect x={72} y={58} width={16} height={14} rx={4} fill="#1d2127" stroke="#3a414b" strokeWidth={2} />
            <Circle cx={80} cy={36} r={23} fill="#1d2127" stroke="#3a414b" strokeWidth={2} />
          </Svg>

          {/* Линии выносок */}
          <Svg
            width={W}
            height={DOLL_H}
            style={{ position: 'absolute', left: 0, top: 0 }}
            pointerEvents="none"
          >
            {lineViews}
          </Svg>

          {/* Ячейки */}
          {bodySlotViews}

          {/* Оружейные слоты */}
          <View style={styles.weaponsRow}>
            {weaponSlotViews}
          </View>
        </View>

        {/* Карточка выбранного слота */}
        <View style={styles.card}>
          {cardContent}
        </View>

        {/* Инлайн-кандидаты из рюкзака */}
        {candidatesSection}

        {/* Монеты */}
        <Card style={{ marginHorizontal: 8, marginTop: 8 }}>
          <Section title={t('inventory.coins')}>
            {[...COIN_ORDER].reverse().map((id) => (
              <View key={id} style={styles.coinRow}>
                <AppText style={styles.coinLabel}>
                  {t('inventory.coin', { name: coinName(id), abbr: coinAbbr(id) })}
                </AppText>
                <TextInput
                  value={String(character.coins[id] ?? 0)}
                  onChangeText={(text) => {
                    const n = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                    update((c) => ({ ...c, coins: { ...c.coins, [id]: n } }));
                  }}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  style={styles.coinInput}
                />
              </View>
            ))}
          </Section>
        </Card>
      </ScrollView>

      <AddItemSheet
        visible={adding}
        onClose={() => setAdding(false)}
        onAdd={(item) => update((c) => ({ ...c, equipment: addToInventory(c.equipment, item) }))}
      />

      {/* Шторка рюкзака */}
      <BottomSheet
        visible={bagOpen}
        title={`${t('inventory.bag')} · ${bag.length}`}
        onClose={() => setBagOpen(false)}
      >
        <Pressable style={[styles.cardBtn, styles.cardBtnPrimary, { marginBottom: 8 }]} onPress={() => { setBagOpen(false); setAdding(true); }}>
          <AppText style={[styles.cardBtnText, styles.cardBtnTextPrimary]}>{t('inventory.add')}</AppText>
        </Pressable>
        {bag.length === 0 ? (
          <AppText style={styles.emptyText}>{t('inventory.empty')}</AppText>
        ) : (
          bag.map((inv) => {
            const item = lookupItem(inv.itemId);
            const slots = item ? allSlotsForItem(item) : [];
            const expanded = bagExpandedItem === inv.itemId;
            const isBlocked = slots.length === 1 && slots[0] === 'off' && mainIsTwoHanded;

            return (
              <View key={inv.itemId}>
                <View style={[styles.bagRow, expanded ? styles.bagRowExpanded : null]}>
                  <Pressable
                    style={styles.bagRowMain}
                    onPress={() => {
                      if (slots.length === 0 || isBlocked) return;
                      if (slots.length === 1) {
                        doEquip(slots[0], inv.itemId);
                      } else {
                        setBagExpandedItem(expanded ? null : inv.itemId);
                      }
                    }}
                  >
                    <GameIcon name={itemIcon(item)} size={24} color={slots.length > 0 && !isBlocked ? '#9aa3ae' : '#4a525d'} />
                    <AppText style={styles.bagName}>{itemName(inv)}</AppText>
                    {inv.quantity > 1 && <AppText style={styles.bagQty}>×{inv.quantity}</AppText>}
                    {slots.length > 1 && !isBlocked && (
                      <AppText style={styles.bagEquipArrow}>{expanded ? '▾' : '›'}</AppText>
                    )}
                    {slots.length === 1 && !isBlocked && (
                      <AppText style={styles.bagEquipArrow}>→</AppText>
                    )}
                  </Pressable>
                  <Pressable style={styles.bagDeleteBtn} onPress={() => removeOneFromBag(inv.itemId, inv.quantity)}>
                    <AppText style={styles.bagDeleteBtnText}>−</AppText>
                  </Pressable>
                </View>
                {expanded && (
                  <View style={styles.bagSlotChips}>
                    {slots.map((slotId) => {
                      const def = ALL_SLOT_DEFS.find((d) => d.id === slotId);
                      const label = def ? slotLabel(def) : slotId;
                      const blocked = slotId === 'off' && mainIsTwoHanded;
                      return (
                        <Pressable
                          key={slotId}
                          style={[styles.bagSlotChip, blocked ? styles.optDisabled : null]}
                          onPress={() => { if (!blocked) doEquip(slotId, inv.itemId); }}
                          disabled={blocked}
                        >
                          <AppText style={styles.bagSlotChipText}>{label}</AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </BottomSheet>
    </View>
  );
}

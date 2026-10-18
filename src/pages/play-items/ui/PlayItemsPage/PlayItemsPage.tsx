import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { computeSheet, equipToSlot, fitsSlot, unequipSlot } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import type { Character, SlotId } from '@/entities/character';
import { byId, contentFor, itemName, plain, tr } from '@/shared/content';
import type { Equipment, MagicItem } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, GameIcon } from '@/shared/ui';

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
  const insets = useSafeAreaInsets();
  const isRu = i18n.language === 'ru';

  function slotLabel(def: SlotDef | WeaponSlotDef): string {
    return isRu ? def.labelRu : def.labelEn;
  }

  const [selectedSlot, setSelectedSlot] = useState<SlotId>('body');
  const [sheetMode, setSheetMode] = useState<'pick' | 'bag' | null>(null);
  // undefined = ничего не выбрано; null = «без предмета»; string = id выбранного предмета
  const [pendingChoice, setPendingChoice] = useState<string | null | undefined>(undefined);

  const equippedSlots = character.equippedSlots ?? {};
  const bag = character.equipment;
  const attuned = useMemo(() => countAttuned(equippedSlots), [equippedSlots]);

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

  function doEquip(slotId: SlotId, itemId: string | null) {
    if (itemId) {
      update((c: Character) => equipToSlot(c, slotId, itemId));
    } else {
      update((c: Character) => unequipSlot(c, slotId));
    }
    setSheetMode(null);
    setPendingChoice(undefined);
  }

  const candidates: { inv: typeof bag[number]; item: Equipment | MagicItem }[] = useMemo(() => {
    return bag
      .map((inv) => ({ inv, item: lookupItem(inv.itemId) }))
      .filter((x): x is { inv: typeof bag[number]; item: Equipment | MagicItem } => {
        return !!x.item && fitsSlot(x.item, selectedSlot);
      });
  }, [bag, selectedSlot]);

  const selectedItemId = equippedSlots[selectedSlot] ?? null;
  const selectedItem = selectedItemId ? lookupItem(selectedItemId) : undefined;
  const currentAc = sheet.armorClass;

  function openPickerFor(slotId: SlotId) {
    setSelectedSlot(slotId);
    setPendingChoice(undefined);
    setSheetMode('pick');
  }

  function openPicker() {
    setPendingChoice(undefined);
    setSheetMode('pick');
  }

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
        onPress={() => openPickerFor(s.id)}
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
        onPress={() => openPickerFor(w.id)}
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

  let cardView: React.ReactNode;

  if (!selectedItem || !selectedItemId) {
    cardView = (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <GameIcon name={SLOT_ICONS[selectedSlot]} size={24} color="#4a525d" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={styles.cardTitle}>{t('inventory.slotEmpty')}</AppText>
            <AppText style={styles.cardTag}>{selLabel}</AppText>
          </View>
        </View>
        {candidates.length > 0 && (
          <AppText style={styles.sheetHint}>
            {t('inventory.fittingCount', { count: candidates.length })}
          </AppText>
        )}
        <View style={styles.cardRow}>
          <Pressable style={[styles.cardBtn, styles.cardBtnPrimary]} onPress={openPicker}>
            <AppText style={[styles.cardBtnText, styles.cardBtnTextPrimary]}>
              {t('inventory.choose')}
            </AppText>
          </Pressable>
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

    cardView = (
      <View style={styles.card}>
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
        {!!descText && <AppText style={styles.cardDesc} numberOfLines={3}>{descText}</AppText>}
        <View style={styles.cardRow}>
          <Pressable style={styles.cardBtn} onPress={() => doEquip(selectedSlot, null)}>
            <AppText style={styles.cardBtnText}>{t('inventory.unequip')}</AppText>
          </Pressable>
          <Pressable style={[styles.cardBtn, styles.cardBtnPrimary]} onPress={openPicker}>
            <AppText style={[styles.cardBtnText, styles.cardBtnTextPrimary]}>
              {t('common.change')}
            </AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---------- Шторка выбора ----------

  // «Без предмета» — только если слот занят
  const noneOption: React.ReactNode = selectedItemId ? (() => {
    const noneAc = calcHypoAc(selectedSlot, null);
    const delta = noneAc - currentAc;
    const isSel = pendingChoice === null;
    return (
      <Pressable
        style={[styles.opt, isSel ? styles.optSelected : null]}
        onPress={() => setPendingChoice(null)}
      >
        <GameIcon name={SLOT_ICONS[selectedSlot]} size={32} color="#4a525d" />
        <View style={styles.optMid}>
          <AppText style={styles.optName}>{t('inventory.withoutItem')}</AppText>
        </View>
        <View style={styles.optRight}>
          <AppText style={styles.optAcVal}>{noneAc}</AppText>
          <AppText style={[styles.delta, deltaStyle(delta)]}>{fmtDelta(delta)}</AppText>
        </View>
      </Pressable>
    );
  })() : null;

  const candidateOptions = candidates.map(({ inv, item }) => {
    const id = inv.itemId;
    const isSel = pendingChoice === id;
    const newAc = calcHypoAc(selectedSlot, id);
    const delta = newAc - currentAc;
    const needsAttune = isMagicItem(item) && item.attunement;
    const attuneFull = needsAttune && attuned >= 3 && equippedSlots[selectedSlot] !== id;

    return (
      <Pressable
        key={id}
        style={[
          styles.opt,
          isSel ? styles.optSelected : null,
          attuneFull ? styles.optDisabled : null,
        ]}
        onPress={() => { if (!attuneFull) setPendingChoice(id); }}
        disabled={attuneFull}
      >
        <GameIcon
          name={itemIcon(item)}
          size={32}
          color={isSel ? '#f2b14a' : '#c9c3b8'}
        />
        <View style={styles.optMid}>
          <AppText style={styles.optName}>{itemName({ itemId: id })}</AppText>
          {needsAttune && !attuneFull && (
            <AppText style={styles.optSub}>{t('inventory.attunement')}</AppText>
          )}
          {attuneFull && (
            <AppText style={styles.optWarn}>{t('inventory.noAttunement')}</AppText>
          )}
        </View>
        <View style={styles.optRight}>
          <AppText style={styles.optAcVal}>{newAc}</AppText>
          <AppText style={[styles.delta, deltaStyle(delta)]}>{fmtDelta(delta)}</AppText>
        </View>
      </Pressable>
    );
  });

  const confirmBtn: React.ReactNode = pendingChoice !== undefined ? (() => {
    const targetAc = calcHypoAc(selectedSlot, pendingChoice ?? null);
    const label = pendingChoice
      ? `${t('inventory.equip')} · КЗ ${currentAc} → ${targetAc}`
      : `${t('inventory.unequip')} · КЗ ${currentAc} → ${targetAc}`;
    return (
      <Pressable
        style={[styles.cardBtn, styles.cardBtnPrimary]}
        onPress={() => doEquip(selectedSlot, pendingChoice ?? null)}
      >
        <AppText style={[styles.cardBtnText, styles.cardBtnTextPrimary]}>{label}</AppText>
      </Pressable>
    );
  })() : null;

  // ---------- Рендер ----------

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      {/* Шапка */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText style={styles.title}>{t('inventory.title')}</AppText>
          <AppText style={styles.summary}>
            КЗ {currentAc} · настройка {attuned}/3
          </AppText>
        </View>
        <Pressable style={styles.bagBtn} onPress={() => setSheetMode('bag')}>
          <GameIcon name="person" size={18} color="#9aa3ae" />
          <AppText style={styles.bagBtnText}>
            {t('inventory.bag')} · {bag.length}
          </AppText>
        </Pressable>
      </View>

      {/* Кукла + карточка — в скролле */}
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
        {cardView}
      </ScrollView>

      {/* Шторка выбора предмета */}
      <BottomSheet visible={sheetMode === 'pick'} title={selLabel} onClose={() => setSheetMode(null)}>
        {selectedItemId && (
          <View style={styles.currentItem}>
            <AppText style={styles.currentLabel}>{t('inventory.currentlyEquipped')}</AppText>
            <AppText style={styles.currentName} numberOfLines={1}>
              {itemName({ itemId: selectedItemId })}
            </AppText>
            <AppText style={styles.currentAc}>КЗ {currentAc}</AppText>
          </View>
        )}
        {noneOption}
        {candidates.length === 0 && !selectedItemId && (
          <AppText style={styles.emptyText}>{t('inventory.noOptions')}</AppText>
        )}
        {candidateOptions}
        {confirmBtn}
      </BottomSheet>

      {/* Шторка рюкзака */}
      <BottomSheet
        visible={sheetMode === 'bag'}
        title={`${t('inventory.bag')} · ${bag.length}`}
        onClose={() => setSheetMode(null)}
      >
        {bag.length === 0 ? (
          <AppText style={styles.emptyText}>{t('inventory.empty')}</AppText>
        ) : (
          bag.map((inv) => (
            <View key={inv.itemId} style={styles.bagRow}>
              <GameIcon name={itemIcon(lookupItem(inv.itemId))} size={24} color="#9aa3ae" />
              <AppText style={styles.bagName}>{itemName(inv)}</AppText>
              {inv.quantity > 1 && <AppText style={styles.bagQty}>×{inv.quantity}</AppText>}
            </View>
          ))
        )}
      </BottomSheet>
    </View>
  );
}

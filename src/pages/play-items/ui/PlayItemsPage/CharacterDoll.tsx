import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import type { SlotId } from '@/entities/character';
import { warmCatalogCache } from '@/features/add-item';
import { colors } from '@/shared/config';
import { itemName, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, GameIcon } from '@/shared/ui';

import { BODY_SLOTS, WEAPON_SLOTS, type SlotDef, type WeaponSlotDef } from './constants';
import { fmtHit, isMagicItem, lookupItem, rarityColor } from './helpers';
import { itemIcon, SLOT_ICONS } from '../../lib/itemIcon';
import { DOLL_H, SCALE, styles, W } from './PlayItemsPage.styles';
import type { CharacterDollProps } from './CharacterDoll.types';

export function CharacterDoll({ equippedSlots, selectedSlot, onSelectSlot, attacks }: CharacterDollProps) {
  const { t, i18n } = useTranslation();
  const isRu = i18n.language === 'ru';

  const [dollReady, setDollReady] = useState(false);
  const dollOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = requestIdleCallback(() => {
      warmCatalogCache();
      setDollReady(true);
    });
    return () => cancelIdleCallback(id);
  }, []);

  useEffect(() => {
    if (!dollReady) {
      return;
    }
    Animated.timing(dollOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [dollReady]);

  function slotLabel(def: SlotDef | WeaponSlotDef): string {
    return isRu ? def.labelRu : def.labelEn;
  }

  return (
    <View style={styles.doll}>
      <View style={styles.halo} />

      {dollReady && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: dollOpacity }]}>
          <Svg
            width={Math.round(176 * SCALE)}
            height={Math.round(352 * SCALE)}
            viewBox="0 0 160 320"
            style={styles.svgBody}
          >
            <Path
              d="M50 74 Q80 64 110 74 L132 250 Q80 266 28 250 Z"
              fill={equippedSlots.shoulders ? colors.accentBg : 'transparent'}
              opacity={0.9}
            />
            <Path
              d="M47 82 Q32 100 28 140 L24 196 M113 82 Q128 100 132 140 L136 196"
              stroke="#3a414b"
              strokeWidth={20}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M47 82 Q32 100 28 140 L24 196 M113 82 Q128 100 132 140 L136 196"
              stroke="#1d2127"
              strokeWidth={16}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M60 172 L56 302 M100 172 L104 302"
              stroke="#3a414b"
              strokeWidth={26}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M60 172 L56 302 M100 172 L104 302"
              stroke="#1d2127"
              strokeWidth={22}
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M50 76 Q80 68 110 76 L116 172 Q80 182 44 172 Z"
              fill="#1d2127"
              stroke={equippedSlots.body ? 'rgba(242,177,74,0.55)' : '#3a414b'}
              strokeWidth={2}
            />
            <Rect x={72} y={58} width={16} height={14} rx={4} fill="#1d2127" stroke="#3a414b" strokeWidth={2} />
            <Circle cx={80} cy={36} r={23} fill="#1d2127" stroke="#3a414b" strokeWidth={2} />
          </Svg>

          <Svg width={W} height={DOLL_H} style={styles.svgOverlay} pointerEvents="none">
            {BODY_SLOTS.map((s) => {
              const rawLeft = s.col === 0 ? 14 : 322;
              const rawTop = 22 + s.row * 76;
              const anchorX = s.col === 0 ? (rawLeft + 54) * SCALE : rawLeft * SCALE;
              const anchorY = (rawTop + 27) * SCALE;
              const bodyX = s.pt[0] * SCALE;
              const bodyY = s.pt[1] * SCALE;
              const itemId = equippedSlots[s.id];
              const on = selectedSlot === s.id;
              const color = on ? colors.accent : itemId ? colors.iconMuted : colors.border;
              const strokeWidth = on ? 2 * SCALE : 1.2 * SCALE;
              const dashArr = !itemId && !on ? `${3 * SCALE} ${4 * SCALE}` : undefined;
              return (
                <React.Fragment key={s.id}>
                  <Line
                    x1={anchorX}
                    y1={anchorY}
                    x2={bodyX}
                    y2={bodyY}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dashArr}
                  />
                  <Circle cx={bodyX} cy={bodyY} r={3 * SCALE} fill={color} />
                </React.Fragment>
              );
            })}
          </Svg>

          {BODY_SLOTS.map((s) => {
            const rawLeft = s.col === 0 ? 14 : 322;
            const rawTop = 22 + s.row * 76;
            const itemId = equippedSlots[s.id] ?? null;
            const item = itemId ? lookupItem(itemId) : undefined;
            const on = selectedSlot === s.id;
            const rarColor = item && isMagicItem(item) ? rarityColor(localizeText(item.rarity).text) : colors.iconMuted;
            const iconColor = itemId
              ? rarColor === colors.iconMuted
                ? colors.textTertiary
                : rarColor
              : colors.iconMuted;

            return (
              <Pressable
                key={s.id}
                style={[
                  styles.slot,
                  itemId ? styles.slotFilled : null,
                  on ? styles.slotSelected : null,
                  { left: Math.round(rawLeft * SCALE), top: Math.round(rawTop * SCALE) },
                  itemId && rarColor !== colors.iconMuted ? { borderColor: rarColor } : null,
                ]}
                onPress={() => onSelectSlot(s.id)}
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
          })}

          <View style={styles.weaponsRow}>
            {WEAPON_SLOTS.map((w) => {
              const itemId = equippedSlots[w.id] ?? null;
              const item = itemId ? lookupItem(itemId) : undefined;
              const on = selectedSlot === w.id;
              const eq = item as import('@/shared/content').Equipment | undefined;

              let stat = '';
              if (itemId && eq?.weapon) {
                const atk = attacks.find((a) => a.itemId === itemId);
                if (atk) {
                  stat = `${fmtHit(atk.toHit)} · ${atk.damageDice}`;
                }
              } else if (itemId && eq?.armor?.category === 'shield') {
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
                  onPress={() => onSelectSlot(w.id)}
                >
                  <GameIcon
                    name={item ? itemIcon(item) : SLOT_ICONS[w.id]}
                    size={20}
                    color={itemId ? colors.textTertiary : colors.iconMuted}
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
            })}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '@/shared/config';
import { itemName } from '@/shared/content';
import type { Equipment, MagicItem } from '@/shared/content';
import { AppText, GameIcon } from '@/shared/ui';

import { allSlotsForItem, lookupItem } from './helpers';
import { itemIcon } from '../../lib/itemIcon';
import { styles } from './PlayItemsPage.styles';
import type { BagRowProps } from './BagSheet.types';

export function BagRow({ inv, mainIsTwoHanded, slotLabel, onEquip, onRemove }: BagRowProps) {
  const item = lookupItem(inv.itemId) as Equipment | MagicItem | undefined;
  const slots = item ? allSlotsForItem(item) : [];
  const isBlocked = slots.length === 1 && slots[0] === 'off' && mainIsTwoHanded;
  const [expanded, setExpanded] = useState(false);

  function handleRowPress() {
    if (slots.length === 0 || isBlocked) {
      return;
    }
    if (slots.length === 1) {
      onEquip(slots[0], inv.itemId);
    } else {
      setExpanded((v) => !v);
    }
  }

  return (
    <View>
      <View style={[styles.bagRow, expanded ? styles.bagRowExpanded : null]}>
        <Pressable style={styles.bagRowMain} onPress={handleRowPress}>
          <GameIcon
            name={itemIcon(item)}
            size={24}
            color={slots.length > 0 && !isBlocked ? colors.textSecondary : colors.iconMuted}
          />
          <AppText style={styles.bagName}>{itemName(inv)}</AppText>
          {inv.quantity > 1 && <AppText style={styles.bagQty}>×{inv.quantity}</AppText>}
          {slots.length > 1 && !isBlocked && <AppText style={styles.bagEquipArrow}>{expanded ? '▾' : '›'}</AppText>}
          {slots.length === 1 && !isBlocked && <AppText style={styles.bagEquipArrow}>→</AppText>}
        </Pressable>
        <Pressable style={styles.bagDeleteBtn} onPress={() => onRemove(inv.itemId, inv.quantity)}>
          <AppText style={styles.bagDeleteBtnText}>−</AppText>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.bagSlotChips}>
          {slots.map((slotId) => {
            const blocked = slotId === 'off' && mainIsTwoHanded;
            return (
              <Pressable
                key={slotId}
                style={[styles.bagSlotChip, blocked ? styles.optDisabled : null]}
                onPress={() => {
                  if (!blocked) {
                    onEquip(slotId, inv.itemId);
                  }
                }}
                disabled={blocked}
              >
                <AppText style={styles.bagSlotChipText}>{slotLabel(slotId)}</AppText>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

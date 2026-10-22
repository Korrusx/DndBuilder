import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { InventoryItem, SlotId } from '@/entities/character';
import { colors } from '@/shared/config';
import { itemName } from '@/shared/content';
import type { Equipment, MagicItem } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, GameIcon } from '@/shared/ui';

import { ALL_SLOT_DEFS } from './constants';
import { allSlotsForItem, lookupItem } from './helpers';
import { itemIcon } from '../../lib/itemIcon';
import { styles } from './PlayItemsPage.styles';

type Props = {
  visible: boolean;
  bag: InventoryItem[];
  mainIsTwoHanded: boolean;
  onClose: () => void;
  onAdd: () => void;
  onEquip: (slotId: SlotId, itemId: string) => void;
  onRemove: (itemId: string, qty: number) => void;
};

export function BagSheet({ visible, bag, mainIsTwoHanded, onClose, onAdd, onEquip, onRemove }: Props) {
  const { t, i18n } = useTranslation();
  const isRu = i18n.language === 'ru';

  function slotLabel(slotId: SlotId): string {
    const def = ALL_SLOT_DEFS.find((d) => d.id === slotId);
    if (!def) return slotId;
    return isRu ? def.labelRu : def.labelEn;
  }

  return (
    <BottomSheet visible={visible} title={`${t('inventory.bag')} · ${bag.length}`} onClose={onClose}>
      <Pressable
        style={[styles.cardBtn, styles.cardBtnPrimary, styles.addItemBtn]}
        onPress={() => { onClose(); onAdd(); }}
      >
        <AppText style={[styles.cardBtnText, styles.cardBtnTextPrimary]}>{t('inventory.add')}</AppText>
      </Pressable>

      {bag.length === 0 ? (
        <AppText style={styles.emptyText}>{t('inventory.empty')}</AppText>
      ) : (
        bag.map((inv) => (
          <BagRow
            key={inv.itemId}
            inv={inv}
            mainIsTwoHanded={mainIsTwoHanded}
            slotLabel={slotLabel}
            onEquip={onEquip}
            onRemove={onRemove}
          />
        ))
      )}
    </BottomSheet>
  );
}

type BagRowProps = {
  inv: InventoryItem;
  mainIsTwoHanded: boolean;
  slotLabel: (slotId: SlotId) => string;
  onEquip: (slotId: SlotId, itemId: string) => void;
  onRemove: (itemId: string, qty: number) => void;
};

function BagRow({ inv, mainIsTwoHanded, slotLabel, onEquip, onRemove }: BagRowProps) {
  const item = lookupItem(inv.itemId) as Equipment | MagicItem | undefined;
  const slots = item ? allSlotsForItem(item) : [];
  const isBlocked = slots.length === 1 && slots[0] === 'off' && mainIsTwoHanded;
  const [expanded, setExpanded] = useState(false);

  function handleRowPress() {
    if (slots.length === 0 || isBlocked) return;
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
          {slots.length > 1 && !isBlocked && (
            <AppText style={styles.bagEquipArrow}>{expanded ? '▾' : '›'}</AppText>
          )}
          {slots.length === 1 && !isBlocked && (
            <AppText style={styles.bagEquipArrow}>→</AppText>
          )}
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
                onPress={() => { if (!blocked) onEquip(slotId, inv.itemId); }}
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

import { Pressable } from 'react-native';

import type { SlotId } from '@/entities/character';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet } from '@/shared/ui';

import { ALL_SLOT_DEFS } from './constants';
import { styles } from './PlayItemsPage.styles';
import type { BagSheetProps } from './BagSheet.types';
import { BagRow } from './BagRow';

export function BagSheet({ visible, bag, mainIsTwoHanded, onClose, onAdd, onEquip, onRemove }: BagSheetProps) {
  const { t, i18n } = useTranslation();
  const isRu = i18n.language === 'ru';

  function slotLabel(slotId: SlotId): string {
    const def = ALL_SLOT_DEFS.find((d) => d.id === slotId);
    if (!def) {
      return slotId;
    }
    return isRu ? def.labelRu : def.labelEn;
  }

  return (
    <BottomSheet visible={visible} title={`${t('inventory.bag')} · ${bag.length}`} onClose={onClose}>
      <Pressable
        style={[styles.cardBtn, styles.cardBtnPrimary, styles.addItemBtn]}
        onPress={() => {
          onClose();
          onAdd();
        }}
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

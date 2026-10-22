import { Pressable, View } from 'react-native';

import type { CharacterSheet, SlotId } from '@/entities/character';
import { colors } from '@/shared/config';
import { itemName, plain, localizeText } from '@/shared/content';
import type { Equipment, MagicItem } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, GameIcon } from '@/shared/ui';

import { ALL_SLOT_DEFS } from './constants';

const ARMOR_I18N_KEY: Record<string, string> = {
  shield: 'inventory.acShield',
  light:  'inventory.acLight',
  medium: 'inventory.acMedium',
};
import { fmtHit, isMagicItem, lookupItem, rarityColor } from './helpers';
import { itemIcon, SLOT_ICONS } from '../../lib/itemIcon';
import { styles } from './PlayItemsPage.styles';

type Props = {
  selectedSlot: SlotId;
  selectedItemId: string | null;
  selectedItem: Equipment | MagicItem | undefined;
  attacks: CharacterSheet['attacks'];
  onUnequip: () => void;
};

export function SlotCard({ selectedSlot, selectedItemId, selectedItem, attacks, onUnequip }: Props) {
  const { t, i18n } = useTranslation();

  function buildTag(item: Equipment | MagicItem): string {
    if (isMagicItem(item)) return localizeText(item.rarity).text;
    if (item.weapon) return item.weapon.damage?.type ?? '';
    if (item.armor) {
      const { category, base } = item.armor;
      // значения в таблице — известные ключи, каст безопасен
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (t as any)(ARMOR_I18N_KEY[category] ?? 'inventory.acHeavy', { base }) as string;
    }
    return '';
  }
  const isRu = i18n.language === 'ru';

  const selDef = ALL_SLOT_DEFS.find((s) => s.id === selectedSlot);
  const selLabel = selDef ? (isRu ? selDef.labelRu : selDef.labelEn) : selectedSlot;

  if (!selectedItem || !selectedItemId) {
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <GameIcon name={SLOT_ICONS[selectedSlot]} size={24} color={colors.iconMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={styles.cardTitle}>{t('inventory.slotEmpty')}</AppText>
            <AppText style={styles.cardTag}>{selLabel}</AppText>
          </View>
        </View>
      </View>
    );
  }

  const rarColor = isMagicItem(selectedItem) ? rarityColor(localizeText(selectedItem.rarity).text) : colors.iconMuted;
  const iconColor = rarColor === colors.iconMuted ? colors.textTertiary : rarColor;
  const atk = attacks.find((a) => a.itemId === selectedItemId);
  const atkLine = atk ? `${fmtHit(atk.toHit)} · ${atk.damageDice}` : '';
  const descText = plain(selectedItem.description);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, { borderColor: rarColor }]}>
          <GameIcon name={itemIcon(selectedItem)} size={24} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={styles.cardTitle} numberOfLines={1}>{itemName({ itemId: selectedItemId })}</AppText>
          <AppText style={styles.cardTag}>{buildTag(selectedItem)}</AppText>
        </View>
        {isMagicItem(selectedItem) && selectedItem.attunement
          ? <View style={styles.slotAttuned} />
          : null}
      </View>
      {!!atkLine && <AppText style={styles.cardAtk}>{atkLine}</AppText>}
      {!!descText && <AppText style={styles.cardDesc} numberOfLines={2}>{descText}</AppText>}
      <Pressable style={styles.cardBtn} onPress={onUnequip}>
        <AppText style={styles.cardBtnText}>{t('inventory.unequip')}</AppText>
      </Pressable>
    </View>
  );
}

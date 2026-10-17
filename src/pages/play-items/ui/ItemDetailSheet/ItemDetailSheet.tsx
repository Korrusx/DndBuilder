import { View } from 'react-native';

import { byId, coinAbbr, itemName, plain, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, BottomSheet, Button, GameIcon, SmallButton } from '@/shared/ui';
import { colors } from '@/shared/config';

import { itemIcon } from '../../lib/itemIcon';
import { styles } from './ItemDetailSheet.styles';
import type { ItemDetailSheetProps } from './ItemDetailSheet.types';

function StatChip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.stat, accent && styles.accentStat]}>
      <AppText style={[styles.statText, accent && styles.accentStatText]}>{label}</AppText>
    </View>
  );
}

export function ItemDetailSheet({ item, onEquip, onMagicBonus, onQty, onRemove, onClose }: ItemDetailSheetProps) {
  const { t } = useTranslation();
  if (!item) return null;

  const eq = byId.equipment.get(item.itemId);
  const magic = byId.magicItems.get(item.itemId);
  const icon = itemIcon(eq);
  const name = itemName(item);
  const isWearable = !!(eq?.armor || eq?.weapon);

  const stats: { label: string; accent?: boolean }[] = [];

  if (eq?.weapon?.damage) {
    stats.push({
      label: t('inventory.damage', { dice: eq.weapon.damage.dice, type: eq.weapon.damage.type }),
      accent: true,
    });
    if (item.magicBonus) stats.push({ label: `+${item.magicBonus}`, accent: true });
    if (eq.weapon.twoHandedDamage) {
      stats.push({ label: t('inventory.twoHanded', { dice: eq.weapon.twoHandedDamage.dice, type: eq.weapon.twoHandedDamage.type }) });
    }
  }

  if (eq?.armor) {
    const a = eq.armor;
    let acLabel = '';
    if (a.category === 'shield') acLabel = t('inventory.acShield');
    else if (a.category === 'light') acLabel = t('inventory.acLight', { base: a.base });
    else if (a.category === 'medium') acLabel = t('inventory.acMedium', { base: a.base });
    else acLabel = t('inventory.acHeavy', { base: a.base });
    stats.push({ label: acLabel, accent: true });
  }

  if (magic?.rarity) {
    stats.push({ label: tr(magic.rarity).text });
    if (magic.attunement) stats.push({ label: t('inventory.attunement') });
  }

  if (eq?.cost) {
    stats.push({ label: t('inventory.costVal', { amount: eq.cost.amount, unit: coinAbbr(eq.cost.unit) }) });
  }
  if (eq?.weight) {
    stats.push({ label: t('inventory.weight', { val: eq.weight }) });
  }

  const description = eq ? plain(eq.description) : magic ? plain(magic.description) : '';

  const equipLabel = item.equipped
    ? t('inventory.unequip')
    : eq?.armor
      ? t('inventory.wear')
      : t('inventory.take');

  return (
    <BottomSheet visible title={name} onClose={onClose}>
      <View style={styles.iconWrap}>
        <GameIcon name={icon} size={40} color={item.equipped ? colors.accent : colors.textSecondary} />
      </View>

      {stats.length > 0 ? (
        <View style={styles.statsRow}>
          {stats.map((s, i) => <StatChip key={i} label={s.label} accent={s.accent} />)}
        </View>
      ) : null}

      {description ? <AppText variant="secondary">{description}</AppText> : null}

      <View style={styles.divider} />

      {isWearable ? (
        <SmallButton
          title={equipLabel}
          tone={item.equipped ? 'accent' : 'neutral'}
          onPress={onEquip}
        />
      ) : null}

      {eq?.weapon ? (
        <SmallButton
          title={`${t('inventory.magicBonus')} +${item.magicBonus ?? 0}`}
          tone={item.magicBonus ? 'accent' : 'neutral'}
          onPress={onMagicBonus}
        />
      ) : null}

      <View style={styles.qtyRow}>
        <AppText style={styles.qtyLabel}>Количество</AppText>
        <SmallButton title="−" onPress={() => onQty(item.quantity - 1)} />
        <AppText style={styles.qtyValue}>{item.quantity}</AppText>
        <SmallButton title="+" onPress={() => onQty(item.quantity + 1)} />
      </View>

      <Button title={t('inventory.remove')} variant="danger" onPress={onRemove} />
    </BottomSheet>
  );
}

import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { addToInventory, toggleEquipped } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { AddItemSheet } from '@/features/add-item';
import { byId, coinAbbr, coinName, COIN_ORDER, content, itemName, nameOf } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Card, Screen, SmallButton } from '@/shared/ui';

import { styles } from './PlayItemsPage.styles';

export function PlayItemsPage() {
  const { character: c, sheet, update } = usePlay();
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);

  const setQuantity = (index: number, quantity: number) =>
    update((d) => ({
      ...d,
      equipment: quantity <= 0 ? d.equipment.filter((_, i) => i !== index) : d.equipment.map((it, i) => (i === index ? { ...it, quantity } : it)),
    }));

  return (
    <Screen>
      <AppText variant="secondary">{t('inventory.acNow', { ac: sheet.armorClass })}</AppText>

      <SmallButton title={t('inventory.add')} tone="accent" onPress={() => setAdding(true)} />
      {c.equipment.length === 0 ? <AppText variant="secondary">{t('inventory.empty')}</AppText> : null}
      <View style={styles.list}>
        {c.equipment.map((it, index) => {
          const item = byId.equipment.get(it.itemId);
          const wearable = !!item?.armor || !!item?.weapon;
          const contents = item?.contents?.map((x) => (x.count > 1 ? `${nameOf('equipment', x.id)} ×${x.count}` : nameOf('equipment', x.id)));
          return (
            <View key={`${it.itemId}-${index}`} style={[styles.row, index > 0 && styles.divider]}>
              <View style={styles.fillGap2}>
                <AppText>
                  {itemName(it)}
                  {it.magicBonus ? ` +${it.magicBonus}` : ''}
                </AppText>
                {contents?.length ? (
                  <AppText variant="secondary" style={styles.size12}>
                    {contents.join(', ')}
                  </AppText>
                ) : null}
              </View>
              {item?.weapon ? (
                <SmallButton
                  title={`+${it.magicBonus ?? 0}`}
                  tone={it.magicBonus ? 'accent' : 'neutral'}
                  onPress={() =>
                    update((d) => ({
                      ...d,
                      equipment: d.equipment.map((x, i) => (i === index ? { ...x, magicBonus: ((x.magicBonus ?? 0) + 1) % 4 || undefined } : x)),
                    }))
                  }
                />
              ) : null}
              {wearable ? (
                <SmallButton
                  title={it.equipped ? (item?.armor ? t('inventory.worn') : t('inventory.held')) : item?.armor ? t('inventory.wear') : t('inventory.take')}
                  tone={it.equipped ? 'accent' : 'neutral'}
                  onPress={() => update((d) => ({ ...d, equipment: toggleEquipped(d.equipment, index, content) }))}
                />
              ) : null}
              <View style={styles.qty}>
                <SmallButton title="−" onPress={() => setQuantity(index, it.quantity - 1)} />
                <AppText style={styles.qtyValue}>{it.quantity}</AppText>
                <SmallButton title="+" onPress={() => setQuantity(index, it.quantity + 1)} />
              </View>
            </View>
          );
        })}
      </View>

      <Card>
        <AppText variant="heading">{t('inventory.coins')}</AppText>
        {[...COIN_ORDER].reverse().map((id) => ({ id, label: t('inventory.coin', { name: coinName(id), abbr: coinAbbr(id) }) })).map((coin) => (
          <View key={coin.id} style={styles.coinRow}>
            <AppText style={styles.fill}>{coin.label}</AppText>
            <TextInput
              value={String(c.coins[coin.id] ?? 0)}
              onChangeText={(text) => {
                const n = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                update((d) => ({ ...d, coins: { ...d.coins, [coin.id]: n } }));
              }}
              keyboardType="number-pad"
              selectTextOnFocus
              style={styles.coinInput}
            />
          </View>
        ))}
      </Card>
      <AddItemSheet
        visible={adding}
        onClose={() => setAdding(false)}
        onAdd={(item) => update((d) => ({ ...d, equipment: addToInventory(d.equipment, item) }))}
      />
    </Screen>
  );
}

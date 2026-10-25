import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { addToInventory, equipToSlot, fitsSlot, unequipSlot } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import type { Character, SlotId } from '@/entities/character';
import { AddItemSheet } from '@/features/add-item';
import { coinAbbr, coinName, COIN_ORDER, itemName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Card, GameIcon, InfoSheet, Section } from '@/shared/ui';

import { BagSheet } from './BagSheet';
import { CandidatesSection } from './CandidatesSection';
import { CharacterDoll } from './CharacterDoll';
import { SlotCard } from './SlotCard';
import { countAttuned, isTwoHandedWeapon, lookupItem } from './helpers';
import { styles } from './PlayItemsPage.styles';

export function PlayItemsPage() {
  const { character, sheet, update } = usePlay();
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedSlot, setSelectedSlot] = useState<SlotId>('body');
  const [bagOpen, setBagOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addingEver, setAddingEver] = useState(false);
  const [attunementInfo, setAttunementInfo] = useState(false);

  const equippedSlots = character.equippedSlots ?? {};
  const bag = character.equipment;
  const attuned = useMemo(() => countAttuned(equippedSlots), [equippedSlots]);
  const mainIsTwoHanded = useMemo(() => {
    const mid = equippedSlots.main;
    return mid ? isTwoHandedWeapon(mid) : false;
  }, [equippedSlots]);

  const candidates = useMemo(() => {
    if (selectedSlot === 'off' && mainIsTwoHanded) {
      return [];
    }
    return bag
      .map((inv) => ({ inv, item: lookupItem(inv.itemId) }))
      .filter(
        (x): x is typeof x & { item: NonNullable<(typeof x)['item']> } => !!x.item && fitsSlot(x.item, selectedSlot),
      );
  }, [bag, selectedSlot, mainIsTwoHanded]);

  function doEquip(slotId: SlotId, itemId: string | null) {
    if (itemId) {
      update((c: Character) => {
        let next = equipToSlot(c, slotId, itemId);
        if (slotId === 'main' && isTwoHandedWeapon(itemId)) {
          next = unequipSlot(next, 'off');
        }
        return next;
      });
    } else {
      update((c: Character) => unequipSlot(c, slotId));
    }
    setBagOpen(false);
  }

  function removeOneFromBag(itemId: string, qty: number) {
    const name = itemName({ itemId });
    const msg = qty > 1 ? t('inventory.confirmRemoveQty', { name, qty }) : t('inventory.confirmRemove', { name });
    Alert.alert(name, msg, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('inventory.remove'),
        style: 'destructive',
        onPress: () =>
          update((c) => ({
            ...c,
            equipment: c.equipment
              .map((x) => (x.itemId === itemId ? { ...x, quantity: x.quantity - 1 } : x))
              .filter((x) => x.quantity > 0),
          })),
      },
    ]);
  }

  const selectedItemId = equippedSlots[selectedSlot] ?? null;
  const selectedItem = selectedItemId ? lookupItem(selectedItemId) : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            {t('inventory.title')}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => setAttunementInfo(true)}
            hitSlop={8}
            style={styles.summaryRow}
          >
            <AppText style={styles.summary}>{t('inventory.summary', { ac: sheet.armorClass, count: attuned })}</AppText>
            <MaterialCommunityIcons name="information-outline" size={14} color={styles.summary.color} />
          </Pressable>
        </View>
        <Pressable style={styles.bagBtn} onPress={() => router.push('/homebrew-equipment')} hitSlop={4}>
          <AppText style={styles.bagBtnText}>{t('homebrew.short')}</AppText>
        </Pressable>
        <Pressable style={[styles.bagBtn, styles.bagBtnRight]} onPress={() => setBagOpen(true)}>
          <GameIcon name="person" size={18} color={styles.bagBtnText.color} />
          <AppText style={styles.bagBtnText}>
            {t('inventory.bag')} · {bag.length}
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CharacterDoll
          equippedSlots={equippedSlots}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          attacks={sheet.attacks}
        />

        <SlotCard
          selectedSlot={selectedSlot}
          selectedItemId={selectedItemId}
          selectedItem={selectedItem}
          attacks={sheet.attacks}
          onUnequip={() => doEquip(selectedSlot, null)}
        />

        <CandidatesSection
          candidates={candidates}
          selectedSlot={selectedSlot}
          mainIsTwoHanded={mainIsTwoHanded}
          equippedSlots={equippedSlots}
          attuned={attuned}
          currentAc={sheet.armorClass}
          character={character}
          onEquip={doEquip}
        />

        <Card style={styles.coinCard}>
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

      {addingEver && (
        <AddItemSheet
          visible={adding}
          onClose={() => setAdding(false)}
          onAdd={(item) => update((c) => ({ ...c, equipment: addToInventory(c.equipment, item) }))}
        />
      )}

      <BagSheet
        visible={bagOpen}
        bag={bag}
        mainIsTwoHanded={mainIsTwoHanded}
        onClose={() => setBagOpen(false)}
        onAdd={() => {
          setAdding(true);
          setAddingEver(true);
        }}
        onEquip={doEquip}
        onRemove={removeOneFromBag}
      />

      <InfoSheet
        info={
          attunementInfo ? { title: t('inventory.attunementInfoTitle'), text: t('inventory.attunementInfoText') } : null
        }
        onClose={() => setAttunementInfo(false)}
      />
    </View>
  );
}

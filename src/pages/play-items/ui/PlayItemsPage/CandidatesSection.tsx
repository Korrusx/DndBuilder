import { Pressable, View } from 'react-native';

import { computeSheet } from '@/entities/character';
import { contentFor } from '@/shared/content';
import type { Character, CharacterSheet, InventoryItem, SlotId } from '@/entities/character';
import { colors } from '@/shared/config';
import { itemName } from '@/shared/content';
import type { Equipment, MagicItem } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, GameIcon } from '@/shared/ui';

import { fmtDelta, isMagicItem, isTwoHandedWeapon } from './helpers';
import { itemIcon } from '../../lib/itemIcon';
import { styles } from './PlayItemsPage.styles';

type Candidate = { inv: InventoryItem; item: Equipment | MagicItem };

type Props = {
  candidates: Candidate[];
  selectedSlot: SlotId;
  mainIsTwoHanded: boolean;
  equippedSlots: Partial<Record<string, string>>;
  attuned: number;
  currentAc: number;
  character: Character;
  sheet: CharacterSheet;
  onEquip: (slotId: SlotId, itemId: string) => void;
};

function deltaStyle(delta: number) {
  return delta > 0 ? styles.deltaUp : delta < 0 ? styles.deltaDown : styles.deltaEq;
}

function calcHypoAc(
  slotId: SlotId,
  itemId: string,
  character: Character,
  equippedSlots: Partial<Record<string, string>>,
  fallback: number,
): number {
  try {
    const slots = { ...equippedSlots, [slotId]: itemId };
    return computeSheet({ ...character, equippedSlots: slots }, contentFor(character.edition)).armorClass;
  } catch {
    return fallback;
  }
}

export function CandidatesSection({
  candidates,
  selectedSlot,
  mainIsTwoHanded,
  equippedSlots,
  attuned,
  currentAc,
  character,
  onEquip,
}: Props) {
  const { t } = useTranslation();

  if (selectedSlot === 'off' && mainIsTwoHanded) {
    return <AppText style={styles.twoHandedWarn}>{t('inventory.twoHandedBlocked')}</AppText>;
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
        const newAc = calcHypoAc(selectedSlot, id, character, equippedSlots, currentAc);
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
            onPress={() => { if (!attuneFull) onEquip(selectedSlot, id); }}
            disabled={attuneFull}
          >
            <GameIcon name={itemIcon(item)} size={32} color={colors.textTertiary} />
            <View style={styles.optMid}>
              <AppText style={styles.optName}>{itemName({ itemId: id })}</AppText>
              {willClearOff && <AppText style={styles.optSub}>{t('inventory.willClearOff')}</AppText>}
              {needsAttune && !attuneFull && <AppText style={styles.optSub}>{t('inventory.attunement')}</AppText>}
              {attuneFull && <AppText style={styles.optWarn}>{t('inventory.noAttunement')}</AppText>}
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
}

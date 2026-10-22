import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  characterResources,
  endRage,
  speedWithExhaustion,
  startRage,
  unarmedStrike,
  weaponMasteryCount,
  weaponMasteryOptions,
} from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import type { D20Request, DamageRequest } from '@/features/roll-dice';
import { d20Parts, D20Sheet, DamageSheet } from '@/features/roll-dice';
import { content, nameOf } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatFeet, formatModifier } from '@/shared/lib/dice';
import { AppText, BottomSheet, InfoSheet, MultiPick, Screen, SmallButton, StatBox } from '@/shared/ui';

import { AttackCard } from '../AttackCard/AttackCard';
import { RageCard } from '../RageCard/RageCard';
import { SneakAttackCard } from '../SneakAttackCard/SneakAttackCard';
import { SmiteCard } from '../SmiteCard/SmiteCard';
import { UnarmedCard } from '../UnarmedCard/UnarmedCard';
import { styles } from './PlayCombatPage.styles';

export function PlayCombatPage() {
  const { character, sheet, update, updateState } = usePlay();
  const { t } = useTranslation();

  const [roll, setRoll] = useState<D20Request | null>(null);
  const [damage, setDamage] = useState<DamageRequest | null>(null);
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null);
  const [bagWeaponsOpen, setBagWeaponsOpen] = useState(false);
  const [editMastery, setEditMastery] = useState(false);

  const exhaustion = character.state.exhaustion;
  const masteryCount = weaponMasteryCount(character, content);
  const equippedIds = new Set(Object.values(character.equippedSlots ?? {}).filter(Boolean) as string[]);
  const equippedAttacks = sheet.attacks.filter((attack) => equippedIds.has(attack.itemId));
  const bagAttacks = sheet.attacks.filter((attack) => !equippedIds.has(attack.itemId));

  const unarmed = unarmedStrike(sheet.abilities.str.mod, sheet.profBonus, sheet.rageDamage);
  const brawler = sheet.features.some((f) => f.source === 'feat' && f.id === 'tavern-brawler');
  const sneak = sheet.classSpecific.rogue?.sneak_attack as { dice_count: number; dice_value: number } | undefined;

  const rage = sheet.classSpecific.barbarian
    ? characterResources(character, content, sheet).find((r) => r.id === 'rage')
    : undefined;
  const rageLeft = rage ? rage.max - Math.min(rage.max, character.state.resourcesSpent.rage ?? 0) : 0;
  const rageBonus = sheet.classSpecific.barbarian?.rage_damage_bonus;

  const slots = sheet.spellcasting?.slots ?? [];
  const hasSmite =
    slots.some((n) => n > 0) &&
    (sheet.features.some((f) => f.id === 'paladin-paladins-smite') ||
      character.preparedSpells.includes('divine-smite'));
  const hasFreeSmiteFeature = sheet.features.some((f) => f.id === 'paladin-paladins-smite');
  const freeSmiteLeft = (character.state.resourcesSpent['paladins-smite.free'] ?? 0) > 0 ? 0 : 1;

  const attackCardProps = {
    weaponMasteries: character.weaponMasteries,
    exhaustion,
    onRoll: setRoll,
    onDamage: setDamage,
    onInfo: setInfo,
  };

  return (
    <Screen>
      <View style={styles.row}>
        <StatBox label={t('stats.ac')} value={String(sheet.armorClass)} />
        <StatBox
          label={t('stats.initiative')}
          value={formatModifier(sheet.initiative)}
          accent
          onPress={() =>
            setRoll({
              title: t('stats.initiative'),
              parts: d20Parts([{ label: t('stats.initiative'), value: sheet.initiative }], exhaustion),
            })
          }
        />
        <StatBox
          label={t('stats.speed')}
          value={formatFeet(speedWithExhaustion(sheet.speed, exhaustion, character.edition))}
        />
      </View>

      {rage ? (
        <RageCard
          rage={rage}
          rageLeft={rageLeft}
          rageBonus={rageBonus as number | undefined}
          isRaging={!!character.state.raging}
          onStart={() => updateState((s) => startRage(s, rage.max) ?? s)}
          onEnd={() => updateState(endRage)}
        />
      ) : null}

      <AppText variant="heading">{t('combat.attacks')}</AppText>

      {equippedAttacks.length === 0 && (
        <AppText style={styles.noWeaponHint}>
          {t('combat.noEquippedWeapons')} · {t('combat.noEquippedHint')}
        </AppText>
      )}

      {equippedAttacks.map((attack) => (
        <AttackCard key={attack.key} attack={attack} {...attackCardProps} />
      ))}

      {bagAttacks.length > 0 && (
        <>
          <Pressable style={styles.bagHeader} onPress={() => setBagWeaponsOpen((v) => !v)}>
            <AppText style={styles.bagHeaderText}>
              {t('combat.bagWeapons')} · {bagAttacks.length}
            </AppText>
            <AppText style={styles.bagChevron}>{bagWeaponsOpen ? '▾' : '›'}</AppText>
          </Pressable>
          {bagWeaponsOpen &&
            bagAttacks.map((attack) => <AttackCard key={attack.key} attack={attack} {...attackCardProps} />)}
        </>
      )}

      <UnarmedCard
        toHit={unarmed.toHit}
        damage={unarmed.damage}
        brawler={brawler}
        strMod={sheet.abilities.str.mod}
        rageDamage={sheet.rageDamage}
        exhaustion={exhaustion}
        onRoll={setRoll}
        onDamage={setDamage}
      />

      {sneak ? (
        <SneakAttackCard diceCount={sneak.dice_count} diceSides={sneak.dice_value} onDamage={setDamage} />
      ) : null}

      {hasSmite ? (
        <SmiteCard
          slots={slots}
          hasFreeSmiteFeature={hasFreeSmiteFeature}
          freeSmiteLeft={freeSmiteLeft}
          characterState={character.state}
          onDamage={setDamage}
          onUpdateState={updateState}
        />
      ) : null}

      <AppText variant="secondary" style={styles.muted}>
        {t('combat.critHint', { d20: t('roll.d20') })}
      </AppText>

      {masteryCount ? (
        <>
          <AppText variant="heading">{t('combat.masteries')}</AppText>
          <AppText variant="secondary">
            {character.weaponMasteries.length
              ? character.weaponMasteries.map((id) => nameOf('equipment', id)).join(', ')
              : t('combat.noMasteries')}{' '}
            · {t('combat.masteriesCount', { count: character.weaponMasteries.length, max: masteryCount })}
          </AppText>
          <SmallButton title={t('combat.editMasteries')} onPress={() => setEditMastery(true)} />
        </>
      ) : null}

      <BottomSheet visible={editMastery} title={t('combat.masteries')} onClose={() => setEditMastery(false)}>
        <AppText variant="secondary">{t('combat.masteriesHint')}</AppText>
        <MultiPick
          options={weaponMasteryOptions(character, content)}
          selected={character.weaponMasteries}
          max={masteryCount}
          label={(id) => nameOf('equipment', id)}
          onChange={(weaponMasteries) => update((d) => ({ ...d, weaponMasteries }))}
        />
      </BottomSheet>

      <D20Sheet request={roll} onClose={() => setRoll(null)} />
      <DamageSheet request={damage} onClose={() => setDamage(null)} />
      <InfoSheet info={info} onClose={() => setInfo(null)} />
    </Screen>
  );
}

import { useState } from 'react';
import { Alert, View } from 'react-native';

import {
  adjustResource,
  attackName,
  castSpell,
  characterResources,
  divineSmiteDice,
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
import { abilityAbbr, byId, content, nameOf, plain, spellName, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDamage, formatDice, formatFeet, formatModifier } from '@/shared/lib/dice';
import { AppText, BottomSheet, Card, Chip, ChipRow, InfoSheet, MultiPick, Screen, Segmented, SmallButton, StatBox } from '@/shared/ui';

import { styles } from './PlayCombatPage.styles';

/** Ключ в `state.resourcesSpent`: бесплатная «Божественная кара» уже использована. */
const FREE_SMITE = 'paladins-smite.free';

export function PlayCombatPage() {
  const { character: c, sheet, update, updateState } = usePlay();
  const { t } = useTranslation();
  const [editMastery, setEditMastery] = useState(false);
  const masteryCount = weaponMasteryCount(c, content);
  const [roll, setRoll] = useState<D20Request | null>(null);
  const [damage, setDamage] = useState<DamageRequest | null>(null);
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null);
  const ex = c.state.exhaustion;
  const unarmed = unarmedStrike(sheet.abilities.str.mod, sheet.profBonus, sheet.rageDamage);
  // Черта «Трактирный драчун»: безоружный удар 1к4 + СИЛ.
  const brawler = sheet.features.some((f) => f.source === 'feat' && f.id === 'tavern-brawler');
  const sneak = sheet.classSpecific.rogue?.sneak_attack as { dice_count: number; dice_value: number } | undefined;
  const rage = sheet.classSpecific.barbarian ? characterResources(c, content, sheet).find((r) => r.id === 'rage') : undefined;
  const rageLeft = rage ? rage.max - Math.min(rage.max, c.state.resourcesSpent.rage ?? 0) : 0;
  const rageBonus = sheet.classSpecific.barbarian?.rage_damage_bonus;
  // «Божественная кара»: у паладина со 2-го уровня («Кара паладина») всегда подготовлена.
  const slots = sheet.spellcasting?.slots ?? [];
  const smite =
    slots.some((n) => n > 0) && (sheet.features.some((f) => f.id === 'paladin-paladins-smite') || c.preparedSpells.includes('divine-smite'));
  const smiteLevels = slots.map((n, i) => (n > 0 ? i + 1 : 0)).filter(Boolean);
  const [smiteLevel, setSmiteLevel] = useState<string>('1');
  const [smiteFiend, setSmiteFiend] = useState(false);
  const smiteSlot = smiteLevel === 'free' ? 1 : Number(smiteLevel);
  // «Кара паладина»: раз до долгого отдыха без ячейки (долгий отдых обнуляет все ресурсы).
  const freeSmiteLeft = (c.state.resourcesSpent[FREE_SMITE] ?? 0) > 0 ? 0 : 1;
  const castSmite = () => {
    const dice = divineSmiteDice(smiteSlot, smiteFiend);
    if (smiteLevel === 'free') {
      if (!freeSmiteLeft) {
        Alert.alert(t('combat.smiteFree'), t('combat.smiteFreeUsed'));
        return;
      }
      updateState((s) => adjustResource(s, FREE_SMITE, 1, 1));
    } else {
      const result = castSpell(c.state, 1, slots, smiteSlot);
      if (!result) {
        Alert.alert(t('magic.noSlots'), t('combat.smiteNoSlot', { level: smiteSlot }));
        return;
      }
      updateState(() => result.state);
    }
    setDamage({ title: spellName('divine-smite'), dice, bonus: 0, damageType: damageType('radiant') });
  };

  const damageType = (id?: string) => (id ? tr(byId.damageTypes.get(id)?.name).text || id : undefined);

  return (
    <Screen>
      <View style={styles.row}>
        <StatBox label={t('stats.ac')} value={String(sheet.armorClass)} />
        <StatBox
          label={t('stats.initiative')}
          value={formatModifier(sheet.initiative)}
          accent
          onPress={() => setRoll({ title: t('stats.initiative'), parts: d20Parts([{ label: t('stats.initiative'), value: sheet.initiative }], ex) })}
        />
        <StatBox label={t('stats.speed')} value={formatFeet(speedWithExhaustion(sheet.speed, ex, c.edition))} />
      </View>

      {rage ? (
        <Card style={styles.gapSm}>
          <View style={styles.row}>
            <View style={styles.fill}>
              <AppText variant="heading">{tr(rage.name).text}</AppText>
              <AppText variant="secondary">
                {c.state.raging ? t('combat.rageActive', { bonus: rageBonus }) : t('combat.rageInactive', { left: rageLeft, max: rage.max })}
              </AppText>
            </View>
            {c.state.raging ? (
              <SmallButton title={t('combat.rageEnd')} onPress={() => updateState(endRage)} />
            ) : (
              <SmallButton
                title={t('combat.rageStart')}
                tone="accent"
                disabled={rageLeft === 0}
                onPress={() => updateState((s) => startRage(s, rage.max) ?? s)}
              />
            )}
          </View>
        </Card>
      ) : null}

      <AppText variant="heading">{t('combat.attacks')}</AppText>
      {sheet.attacks.map((a) => {
        const item = byId.equipment.get(a.itemId);
        const name = attackName(a);
        const mastery = c.weaponMasteries.includes(a.itemId) ? item?.weapon?.mastery : undefined;
        const masteryEntry = mastery ? byId.weaponMasteries.get(mastery) : undefined;
        return (
          <Card key={a.key} style={styles.gapSm}>
            <View style={styles.row}>
              <View style={styles.fill}>
                <AppText variant="heading">{name}</AppText>
                <AppText variant="secondary">
                  {abilityAbbr(a.ability)}
                  {a.proficient ? '' : t('combat.notProficient')}
                  {item?.weapon?.reach.long ? ` · ${formatFeet(item.weapon.reach.normal)}/${formatFeet(item.weapon.reach.long)}` : ''}
                </AppText>
              </View>
              <AppText style={styles.big}>{formatModifier(a.toHit)}</AppText>
            </View>
            <View style={styles.row}>
              <SmallButton
                title={t('combat.attack', { value: formatModifier(a.toHit) })}
                tone="accent"
                flex={1}
                onPress={() =>
                  setRoll({ title: t('combat.attackOf', { name }), parts: d20Parts([{ label: t('combat.hit'), value: a.toHit }], ex) })
                }
              />
              <SmallButton
                title={t('combat.damage', { value: formatDamage(a.damageDice, a.damageBonus) })}
                tone="damage"
                flex={1}
                onPress={() =>
                  setDamage({
                    title: t('combat.damageOf', { name }),
                    dice: a.damageDice,
                    bonus: a.damageBonus,
                    damageType: damageType(a.damageType),
                    minDie: a.damageMinDie,
                  })
                }
              />
            </View>
            {a.strengthAlt ? (
              <View style={styles.row}>
                <SmallButton
                  title={t('combat.strengthAttack', { value: formatModifier(a.strengthAlt.toHit) })}
                  tone="accent"
                  flex={1}
                  onPress={() =>
                    setRoll({ title: t('combat.attackOf', { name }), parts: d20Parts([{ label: t('combat.hit'), value: a.strengthAlt!.toHit }], ex) })
                  }
                />
                <SmallButton
                  title={t('combat.damage', { value: formatDamage(a.damageDice, a.strengthAlt.damageBonus) })}
                  tone="damage"
                  flex={1}
                  onPress={() =>
                    setDamage({ title: t('combat.damageOf', { name }), dice: a.damageDice, bonus: a.strengthAlt!.damageBonus, damageType: damageType(a.damageType) })
                  }
                />
              </View>
            ) : null}
            {a.offhandDamageBonus !== undefined ? (
              <SmallButton
                title={t('combat.offhand', { value: formatDamage(a.damageDice, a.offhandDamageBonus) })}
                tone="damage"
                onPress={() =>
                  setDamage({
                    title: t('combat.offhandOf', { name }),
                    dice: a.damageDice,
                    bonus: a.offhandDamageBonus!,
                    damageType: damageType(a.damageType),
                    note: t('combat.offhandNote'),
                  })
                }
              />
            ) : null}
            {a.twoHanded ? (
              <SmallButton
                title={t('combat.twoHanded', { value: formatDamage(a.twoHanded.dice, a.damageBonus) })}
                tone="damage"
                onPress={() =>
                  setDamage({
                    title: t('combat.damageOf', { name }),
                    dice: a.twoHanded!.dice,
                    bonus: a.damageBonus,
                    damageType: damageType(a.damageType),
                    minDie: a.twoHanded!.minDie,
                  })
                }
              />
            ) : null}
            {masteryEntry ? (
              <SmallButton
                title={t('combat.mastery', { name: tr(masteryEntry.name).text })}
                onPress={() => setInfo({ title: tr(masteryEntry.name).text, text: plain(masteryEntry.description) })}
              />
            ) : null}
          </Card>
        );
      })}

      <Card style={styles.gapSm}>
        <View style={styles.row}>
          <View style={styles.fill}>
            <AppText variant="heading">{t('combat.unarmed')}</AppText>
            <AppText variant="secondary">
              {t('combat.unarmedDamage', { damage: brawler ? formatDamage('1d4', sheet.abilities.str.mod + sheet.rageDamage) : unarmed.damage, type: damageType('bludgeoning') })}
            </AppText>
          </View>
          <SmallButton
            title={t('combat.attack', { value: formatModifier(unarmed.toHit) })}
            tone="accent"
            onPress={() => setRoll({ title: t('combat.unarmed'), parts: d20Parts([{ label: t('combat.hit'), value: unarmed.toHit }], ex) })}
          />
          {brawler ? (
            <SmallButton
              title={t('combat.damageShort')}
              tone="damage"
              onPress={() => setDamage({ title: t('combat.unarmed'), dice: '1d4', bonus: sheet.abilities.str.mod + sheet.rageDamage, damageType: damageType('bludgeoning') })}
            />
          ) : null}
        </View>
      </Card>

      {sneak ? (
        <Card style={styles.gapSm}>
          <View style={styles.row}>
            <View style={styles.fill}>
              <AppText variant="heading">{nameOf('features', 'rogue-sneak-attack')}</AppText>
              <AppText variant="secondary">{t('combat.sneakHint')}</AppText>
            </View>
            <SmallButton
              title={formatDice({ count: sneak.dice_count, sides: sneak.dice_value })}
              tone="damage"
              onPress={() => setDamage({ title: nameOf('features', 'rogue-sneak-attack'), dice: `${sneak.dice_count}d${sneak.dice_value}`, bonus: 0 })}
            />
          </View>
        </Card>
      ) : null}

      {smite ? (
        <Card style={styles.gapSm}>
          <AppText variant="heading">{spellName('divine-smite')}</AppText>
          <AppText variant="secondary">{t('combat.smiteHint')}</AppText>
          <Segmented<string>
            value={smiteLevel}
            onChange={setSmiteLevel}
            options={[
              ...smiteLevels.map((n) => ({ value: String(n), label: t('spell.circle', { level: n }) })),
              ...(sheet.features.some((f) => f.id === 'paladin-paladins-smite') ? [{ value: 'free', label: t('combat.smiteFree') }] : []),
            ]}
          />
          {smiteLevel === 'free' ? <AppText variant="secondary">{t('combat.smiteFreeHint', { left: freeSmiteLeft })}</AppText> : null}
          <ChipRow>
            <Chip label={t('combat.smiteFiend')} selected={smiteFiend} onPress={() => setSmiteFiend((v) => !v)} />
          </ChipRow>
          <SmallButton
            title={t('combat.smiteCast', { dice: formatDice(divineSmiteDice(smiteSlot, smiteFiend)) })}
            tone="damage"
            onPress={castSmite}
          />
        </Card>
      ) : null}

      <AppText variant="secondary" style={styles.muted}>
        {t('combat.critHint', { d20: t('roll.d20') })}
      </AppText>

      {masteryCount ? (
        <Card style={styles.gapSm}>
          <AppText variant="heading">{t('combat.masteries')}</AppText>
          <AppText variant="secondary">
            {c.weaponMasteries.length ? c.weaponMasteries.map((id) => nameOf('equipment', id)).join(', ') : t('combat.noMasteries')} ·{' '}
            {t('combat.masteriesCount', { count: c.weaponMasteries.length, max: masteryCount })}
          </AppText>
          <SmallButton title={t('combat.editMasteries')} onPress={() => setEditMastery(true)} />
        </Card>
      ) : null}

      <BottomSheet visible={editMastery} title={t('combat.masteries')} onClose={() => setEditMastery(false)}>
        <AppText variant="secondary">{t('combat.masteriesHint')}</AppText>
        <MultiPick
          options={weaponMasteryOptions(c, content)}
          selected={c.weaponMasteries}
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

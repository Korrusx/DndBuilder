import { useState } from 'react';
import { View } from 'react-native';

import { speedWithExhaustion, unarmedStrike, weaponMasteryCount, weaponMasteryOptions } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import type { D20Request, DamageRequest } from '@/features/roll-dice';
import { d20Parts, D20Sheet, DamageSheet } from '@/features/roll-dice';
import { abilityAbbr, byId, content, nameOf, plain, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDamage, formatDice, formatFeet, formatModifier } from '@/shared/lib/dice';
import { AppText, BottomSheet, Card, InfoSheet, MultiPick, Screen, SmallButton, StatBox } from '@/shared/ui';

import { styles } from './PlayCombatPage.styles';

export function PlayCombatPage() {
  const { character: c, sheet, update } = usePlay();
  const { t } = useTranslation();
  const [editMastery, setEditMastery] = useState(false);
  const masteryCount = weaponMasteryCount(c, content);
  const [roll, setRoll] = useState<D20Request | null>(null);
  const [damage, setDamage] = useState<DamageRequest | null>(null);
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null);
  const ex = c.state.exhaustion;
  const unarmed = unarmedStrike(sheet.abilities.str.mod, sheet.profBonus);
  // Черта «Трактирный драчун»: безоружный удар 1к4 + СИЛ.
  const brawler = sheet.features.some((f) => f.source === 'feat' && f.id === 'tavern-brawler');
  const sneak = sheet.classSpecific.rogue?.sneak_attack as { dice_count: number; dice_value: number } | undefined;

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
        <StatBox label={t('stats.speed')} value={formatFeet(speedWithExhaustion(sheet.speed, ex))} />
      </View>

      <AppText variant="heading">{t('combat.attacks')}</AppText>
      {sheet.attacks.map((a) => {
        const item = byId.equipment.get(a.itemId);
        const mastery = c.weaponMasteries.includes(a.itemId) ? item?.weapon?.mastery : undefined;
        const masteryEntry = mastery ? byId.weaponMasteries.get(mastery) : undefined;
        return (
          <Card key={a.itemId} style={styles.gapSm}>
            <View style={styles.row}>
              <View style={styles.fill}>
                <AppText variant="heading">{nameOf('equipment', a.itemId)}</AppText>
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
                  setRoll({ title: t('combat.attackOf', { name: nameOf('equipment', a.itemId) }), parts: d20Parts([{ label: t('combat.hit'), value: a.toHit }], ex) })
                }
              />
              <SmallButton
                title={t('combat.damage', { value: formatDamage(a.damageDice, a.damageBonus) })}
                tone="damage"
                flex={1}
                onPress={() =>
                  setDamage({ title: t('combat.damageOf', { name: nameOf('equipment', a.itemId) }), dice: a.damageDice, bonus: a.damageBonus, damageType: damageType(a.damageType) })
                }
              />
            </View>
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
              {t('combat.unarmedDamage', { damage: brawler ? formatDamage('1d4', sheet.abilities.str.mod) : unarmed.damage, type: damageType('bludgeoning') })}
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
              onPress={() => setDamage({ title: t('combat.unarmed'), dice: '1d4', bonus: sheet.abilities.str.mod, damageType: damageType('bludgeoning') })}
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

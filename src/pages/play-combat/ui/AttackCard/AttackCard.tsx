import { View } from 'react-native';

import { attackName } from '@/entities/character';
import type { D20Request, DamageRequest } from '@/features/roll-dice';
import { d20Parts } from '@/features/roll-dice';
import { abilityAbbr, byId, localizeText, plain } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDamage, formatFeet, formatModifier } from '@/shared/lib/dice';
import { AppText, Card, SmallButton } from '@/shared/ui';

import { damageTypeName } from '../../lib/damageType';
import { styles } from './AttackCard.styles';
import type { AttackCardProps } from './AttackCard.types';

export function AttackCard({ attack, weaponMasteries, exhaustion, onRoll, onDamage, onInfo }: AttackCardProps) {
  const { t } = useTranslation();
  const item = byId.equipment.get(attack.itemId);
  const name = attackName(attack);
  const mastery = weaponMasteries.includes(attack.itemId) ? item?.weapon?.mastery : undefined;
  const masteryEntry = mastery ? byId.weaponMasteries.get(mastery) : undefined;

  const rollAttack = (toHit: number) =>
    onRoll({
      title: t('combat.attackOf', { name }),
      parts: d20Parts([{ label: t('combat.hit'), value: toHit }], exhaustion),
    });

  const rollDamage = (dice: string, bonus: number, minDie?: number): DamageRequest => ({
    title: t('combat.damageOf', { name }),
    dice,
    bonus,
    damageType: damageTypeName(attack.damageType),
    minDie,
  });

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.fill}>
          <AppText variant="heading">{name}</AppText>
          <AppText variant="secondary">
            {abilityAbbr(attack.ability)}
            {attack.proficient ? '' : t('combat.notProficient')}
            {item?.weapon?.reach.long
              ? ` · ${formatFeet(item.weapon.reach.normal)}/${formatFeet(item.weapon.reach.long)}`
              : ''}
          </AppText>
        </View>
        <AppText style={styles.toHit}>{formatModifier(attack.toHit)}</AppText>
      </View>

      <View style={styles.row}>
        <SmallButton
          title={t('combat.attack', { value: formatModifier(attack.toHit) })}
          tone="accent"
          flex={1}
          onPress={() => rollAttack(attack.toHit)}
        />
        <SmallButton
          title={t('combat.damage', { value: formatDamage(attack.damageDice, attack.damageBonus) })}
          tone="damage"
          flex={1}
          onPress={() => onDamage(rollDamage(attack.damageDice, attack.damageBonus, attack.damageMinDie))}
        />
      </View>

      {attack.strengthAlt ? (
        <View style={styles.row}>
          <SmallButton
            title={t('combat.strengthAttack', { value: formatModifier(attack.strengthAlt.toHit) })}
            tone="accent"
            flex={1}
            onPress={() => rollAttack(attack.strengthAlt!.toHit)}
          />
          <SmallButton
            title={t('combat.damage', { value: formatDamage(attack.damageDice, attack.strengthAlt.damageBonus) })}
            tone="damage"
            flex={1}
            onPress={() => onDamage(rollDamage(attack.damageDice, attack.strengthAlt!.damageBonus))}
          />
        </View>
      ) : null}

      {attack.offhandDamageBonus !== undefined ? (
        <SmallButton
          title={t('combat.offhand', { value: formatDamage(attack.damageDice, attack.offhandDamageBonus) })}
          tone="damage"
          onPress={() =>
            onDamage({
              title: t('combat.offhandOf', { name }),
              dice: attack.damageDice,
              bonus: attack.offhandDamageBonus!,
              damageType: damageTypeName(attack.damageType),
              note: t('combat.offhandNote'),
            })
          }
        />
      ) : null}

      {attack.twoHanded ? (
        <SmallButton
          title={t('combat.twoHanded', { value: formatDamage(attack.twoHanded.dice, attack.damageBonus) })}
          tone="damage"
          onPress={() => onDamage(rollDamage(attack.twoHanded!.dice, attack.damageBonus, attack.twoHanded!.minDie))}
        />
      ) : null}

      {masteryEntry ? (
        <SmallButton
          title={t('combat.mastery', { name: localizeText(masteryEntry.name).text })}
          onPress={() => onInfo({ title: localizeText(masteryEntry.name).text, text: plain(masteryEntry.description) })}
        />
      ) : null}
    </Card>
  );
}

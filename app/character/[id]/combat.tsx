import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { usePlay } from '@/components/play/CharacterContext';
import { D20Sheet, d20Parts, DamageSheet, type D20Request, type DamageRequest } from '@/components/play/RollSheet';
import { Card, InfoSheet, plain, SmallButton, StatBox } from '@/components/play/ui';
import { Screen } from '@/components/Screen';
import { abilityAbbr, nameOf } from '@/components/wizard/names';
import { byId, content, tr } from '@/content';
import { formatDamage, formatModifier } from '@/rules/dice';
import { speedWithExhaustion, unarmedStrike } from '@/rules/play';
import { colors, fonts, spacing } from '@/theme';

const masteries = new Map(content.weaponMasteries.map((m) => [m.id, m]));
const damageTypes = new Map(content.damageTypes.map((d) => [d.id, d]));

export default function CombatTab() {
  const { character: c, sheet } = usePlay();
  const [roll, setRoll] = useState<D20Request | null>(null);
  const [damage, setDamage] = useState<DamageRequest | null>(null);
  const [info, setInfo] = useState<{ title: string; text: string } | null>(null);
  const ex = c.state.exhaustion;
  const unarmed = unarmedStrike(sheet.abilities.str.mod, sheet.profBonus);
  const sneak = sheet.classSpecific.rogue?.sneak_attack as { dice_count: number; dice_value: number } | undefined;

  const damageType = (id?: string) => (id ? tr(damageTypes.get(id)?.name).text || id : undefined);

  return (
    <Screen>
      <View style={styles.row}>
        <StatBox label="КЗ" value={String(sheet.armorClass)} />
        <StatBox
          label="Инициатива"
          value={formatModifier(sheet.initiative)}
          accent
          onPress={() => setRoll({ title: 'Инициатива', parts: d20Parts([{ label: 'Инициатива', value: sheet.initiative }], ex) })}
        />
        <StatBox label="Скорость" value={`${speedWithExhaustion(sheet.speed, ex)} фт`} />
      </View>

      <AppText variant="heading">Атаки</AppText>
      {sheet.attacks.map((a) => {
        const item = byId.equipment.get(a.itemId);
        const mastery = c.weaponMasteries.includes(a.itemId) ? item?.weapon?.mastery : undefined;
        const masteryEntry = mastery ? masteries.get(mastery) : undefined;
        return (
          <Card key={a.itemId} style={{ gap: spacing.sm }}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <AppText variant="heading">{nameOf('equipment', a.itemId)}</AppText>
                <AppText variant="secondary">
                  {abilityAbbr(a.ability)}
                  {a.proficient ? '' : ' · без владения'}
                  {item?.weapon?.reach.long ? ` · ${item.weapon.reach.normal}/${item.weapon.reach.long} фт` : ''}
                </AppText>
              </View>
              <AppText style={styles.big}>{formatModifier(a.toHit)}</AppText>
            </View>
            <View style={styles.row}>
              <SmallButton
                title={`Атака ${formatModifier(a.toHit)}`}
                tone="accent"
                flex={1}
                onPress={() =>
                  setRoll({ title: `Атака: ${nameOf('equipment', a.itemId)}`, parts: d20Parts([{ label: 'Попадание', value: a.toHit }], ex) })
                }
              />
              <SmallButton
                title={`Урон ${formatDamage(a.damageDice, a.damageBonus)}`}
                tone="damage"
                flex={1}
                onPress={() =>
                  setDamage({ title: `Урон: ${nameOf('equipment', a.itemId)}`, dice: a.damageDice, bonus: a.damageBonus, damageType: damageType(a.damageType) })
                }
              />
            </View>
            {masteryEntry ? (
              <SmallButton
                title={`Приём: ${tr(masteryEntry.name).text}`}
                onPress={() => setInfo({ title: tr(masteryEntry.name).text, text: plain(masteryEntry.description) })}
              />
            ) : null}
          </Card>
        );
      })}

      <Card style={{ gap: spacing.sm }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AppText variant="heading">Безоружный удар</AppText>
            <AppText variant="secondary">Урон {unarmed.damage}, дробящий</AppText>
          </View>
          <SmallButton
            title={`Атака ${formatModifier(unarmed.toHit)}`}
            tone="accent"
            onPress={() => setRoll({ title: 'Безоружный удар', parts: d20Parts([{ label: 'Попадание', value: unarmed.toHit }], ex) })}
          />
        </View>
      </Card>

      {sneak ? (
        <Card style={{ gap: spacing.sm }}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppText variant="heading">{nameOf('features', 'rogue-sneak-attack')}</AppText>
              <AppText variant="secondary">Раз в ход, при преимуществе или союзнике рядом с целью</AppText>
            </View>
            <SmallButton
              title={`${sneak.dice_count}к${sneak.dice_value}`}
              tone="damage"
              onPress={() => setDamage({ title: 'Скрытая атака', dice: `${sneak.dice_count}d${sneak.dice_value}`, bonus: 0 })}
            />
          </View>
        </Card>
      ) : null}

      <AppText variant="secondary" style={{ color: colors.textSecondary }}>
        Атака — бросок к20; при естественной 20 нажмите «Критический» в панели урона.
      </AppText>

      <D20Sheet request={roll} onClose={() => setRoll(null)} />
      <DamageSheet request={damage} onClose={() => setDamage(null)} />
      <InfoSheet info={info} onClose={() => setInfo(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  big: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.accent },
});

import { useState } from 'react';
import { View } from 'react-native';

import { speedWithExhaustion, unarmedStrike, weaponMasteryCount, weaponMasteryOptions } from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import type { D20Request, DamageRequest } from '@/features/roll-dice';
import { d20Parts, D20Sheet, DamageSheet } from '@/features/roll-dice';
import { abilityAbbr, byId, content, nameOf, plain, tr } from '@/shared/content';
import { formatDamage, formatModifier } from '@/shared/lib/dice';
import { AppText, BottomSheet, Card, InfoSheet, MultiPick, Screen, SmallButton, StatBox } from '@/shared/ui';

import { styles } from './PlayCombatPage.styles';

export function PlayCombatPage() {
  const { character: c, sheet, update } = usePlay();
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
        const masteryEntry = mastery ? byId.weaponMasteries.get(mastery) : undefined;
        return (
          <Card key={a.itemId} style={styles.gapSm}>
            <View style={styles.row}>
              <View style={styles.fill}>
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

      <Card style={styles.gapSm}>
        <View style={styles.row}>
          <View style={styles.fill}>
            <AppText variant="heading">Безоружный удар</AppText>
            <AppText variant="secondary">
              Урон {brawler ? formatDamage('1d4', sheet.abilities.str.mod) : unarmed.damage}, дробящий
            </AppText>
          </View>
          <SmallButton
            title={`Атака ${formatModifier(unarmed.toHit)}`}
            tone="accent"
            onPress={() => setRoll({ title: 'Безоружный удар', parts: d20Parts([{ label: 'Попадание', value: unarmed.toHit }], ex) })}
          />
          {brawler ? (
            <SmallButton
              title="Урон"
              tone="damage"
              onPress={() => setDamage({ title: 'Безоружный удар', dice: '1d4', bonus: sheet.abilities.str.mod, damageType: 'дробящий' })}
            />
          ) : null}
        </View>
      </Card>

      {sneak ? (
        <Card style={styles.gapSm}>
          <View style={styles.row}>
            <View style={styles.fill}>
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

      <AppText variant="secondary" style={styles.muted}>
        Атака — бросок к20; при естественной 20 нажмите «Критический» в панели урона.
      </AppText>

      {masteryCount ? (
        <Card style={styles.gapSm}>
          <AppText variant="heading">Приёмы оружия</AppText>
          <AppText variant="secondary">
            {c.weaponMasteries.length ? c.weaponMasteries.map((id) => nameOf('equipment', id)).join(', ') : 'Не выбраны'} ·{' '}
            {c.weaponMasteries.length} из {masteryCount}
          </AppText>
          <SmallButton title="Изменить приёмы" onPress={() => setEditMastery(true)} />
        </Card>
      ) : null}

      <BottomSheet visible={editMastery} title="Приёмы оружия" onClose={() => setEditMastery(false)}>
        <AppText variant="secondary">Виды оружия, свойства-приёмы которых вы используете. Менять можно после долгого отдыха.</AppText>
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

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import type { SpeciesSpell, SpellDamage } from '@/entities/character';
import {
  adjustPactSlot,
  adjustResource,
  adjustSlot,
  castSpell,
  castWithPactSlot,
  chosenClassOptions,
  classOptionSpells,
  classSpellLists,
  hasSpellbook,
  choice1,
  CHOICE_KEYS,
  magicInitiateSlots,
  speciesSpellcasting,
  spellAttackBonus,
  spellDamage,
  spellDamageLevels,
  spellbook,
  spellOptions,
  spellSaveDC,
  subclassSpellIds,
} from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { SpellsEditSheet } from '@/features/edit-spells';
import type { D20Request, DamageRequest } from '@/features/roll-dice';
import { d20Parts, D20Sheet, DamageSheet } from '@/features/roll-dice';
import type { AbilityId, Spell } from '@/shared/content';
import {
  abilityAbbr,
  byId,
  content,
  nameOf,
  plain,
  spellDescription,
  spellMeta,
  spellName,
  localizeText,
} from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDamage, formatModifier } from '@/shared/lib/dice';
import type { InfoContent } from '@/shared/ui';
import {
  AppText,
  Badge,
  BottomSheet,
  Card,
  Chip,
  ChipRow,
  DotRow,
  InfoSheet,
  Placeholder,
  Screen,
  SmallButton,
  StatBox,
} from '@/shared/ui';

import { styles } from './PlayMagicPage.styles';

export function PlayMagicPage() {
  const { character, sheet, update, updateState } = usePlay();
  const { t } = useTranslation();
  // Класс, чьи заклинания меняем в окне «Изменить заклинания»; null — окно закрыто.
  const [editing, setEditing] = useState<string | null>(null);
  const [info, setInfo] = useState<InfoContent | null>(null);
  const [roll, setRoll] = useState<D20Request | null>(null);
  const [damage, setDamage] = useState<DamageRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [swapping, setSwapping] = useState<SpeciesSpell | null>(null);
  const sc = sheet.spellcasting;
  const pact = sheet.pactSlots;
  // Несколько заклинателей: у каждого свой раздел со своей СЛ и атакой.
  const multi = sheet.spellcastingClasses.length > 1;
  const exhaustion = character.state.exhaustion;

  const initiates = magicInitiateSlots(character, content).map(({ slot, fixedList }) => {
    const ability = choice1(character, CHOICE_KEYS.featAbility(slot)) as AbilityId | undefined;
    const mod = ability ? sheet.abilities[ability].mod : 0;
    return {
      slot,
      list: fixedList ?? choice1(character, CHOICE_KEYS.featSpellList(slot)),
      ability,
      dc: spellSaveDC(mod, sheet.profBonus),
      attack: spellAttackBonus(mod, sheet.profBonus),
      spells: [
        ...(character.choices[CHOICE_KEYS.featCantrips(slot)] ?? []),
        ...(character.choices[CHOICE_KEYS.featSpell(slot)] ?? []),
      ],
    };
  });

  const species = speciesSpellcasting(character, content, sheet);

  if (!sc && initiates.length === 0 && !species) {
    return (
      <Screen>
        <Placeholder title={t('magic.none')} note={t('magic.noneHint')} />
      </Screen>
    );
  }

  /**
   * Сотворить: заговор — без ячейки; иначе ячейка общих или (у колдуна-мультикласса) ячеек договора.
   * Заклинание колдуна сначала берёт ячейку договора, остальные — общую; если нет — из другого запаса (SRD 5.2).
   */
  const cast = (spell: Spell, classId?: string) => {
    if (!sc) {
      return;
    }
    const fromPact = () => (pact ? castWithPactSlot(character.state, spell.level, pact) : null);
    const fromMain = () => castSpell(character.state, spell.level, sc.slots);
    const pactFirst = classId === 'warlock' && !!pact;
    let result = pactFirst ? fromPact() : fromMain();
    let usedPact = pactFirst && !!result;
    if (!result) {
      result = pactFirst ? fromMain() : fromPact();
      usedPact = !pactFirst && !!result;
    }
    if (!result) {
      Alert.alert(t('magic.noSlots'), t('magic.noSlotsHint', { level: spell.level }));
      return;
    }
    const done = result;
    updateState(() => done.state);
    const name = localizeText(spell.name).text;
    setMessage(
      done.slotLevel === 0
        ? t('magic.castCantrip', { name })
        : usedPact && spell.level > 0
          ? t('magic.castPact', { name, level: done.slotLevel })
          : t('magic.castSlot', { name, level: done.slotLevel }),
    );
  };

  // «Мучительный взрыв»: + мод. ХАР к урону заговора; считаем, что выбран «Мистический заряд».
  const agonizing = chosenClassOptions(character, 'invocation').includes('agonizing-blast')
    ? sheet.abilities.cha.mod
    : 0;
  // Заклинания воззваний и Книги теней — заклинания колдуна: его характеристика и ячейки договора.
  const warlockAttack = sheet.spellcastingClasses.find((x) => x.classId === 'warlock')?.attackBonus ?? sc?.attackBonus;
  const topCircle = (xs: number[] = []) => xs.reduce((m, n, i) => (n > 0 ? i + 1 : m), 0);
  const maxSlot = Math.max(topCircle(sc?.slots), topCircle(pact));
  const damageTypeName = (id?: string) => (id ? localizeText(byId.damageTypes.get(id)?.name).text || id : undefined);

  /** Кнопки «Атака» и «Урон» заклинания; `attackBonus` — от характеристики источника (класс, черта, вид). */
  const spellActions = (s: Spell, attackBonus: number | undefined) => {
    const name = localizeText(s.name).text;
    // Модификатор заклинательной характеристики источника: бонус атаки − БМ.
    const mod = attackBonus === undefined ? 0 : attackBonus - sheet.profBonus;
    const total = (d: SpellDamage) => d.bonus + (d.addModifier ? mod : 0) + (s.id === 'eldritch-blast' ? agonizing : 0);
    const base = spellDamage(s, sheet.level);
    if (!s.attackType && !base) {
      return null;
    }
    const beams = base?.beams ?? 1;
    const levels = spellDamageLevels(s, maxSlot).map((level) => ({ level, d: spellDamage(s, sheet.level, level)! }));
    const variants = levels.map(({ level, d }) => ({
      label: t('spell.circle', { level }),
      dice: d.dice,
      bonus: total(d),
    }));
    const differ = new Set(variants.map((v) => `${v.dice}+${v.bonus}`)).size > 1;
    const kind = base?.kind;
    const value = base ? formatDamage(base.dice, total(base)) : '';
    const note = [
      beams > 1 ? t('magic.beamsNote', { count: beams }) : '',
      base?.count ? t('magic.dartsNote', { count: base.count }) : '',
      base?.chosenType ? t('magic.chosenType') : '',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <View style={styles.row}>
        {s.attackType && attackBonus !== undefined ? (
          <SmallButton
            title={t('combat.attack', { value: formatModifier(attackBonus) })}
            tone="accent"
            flex={1}
            onPress={() =>
              setRoll({
                title: t('combat.attackOf', { name }),
                parts: d20Parts([{ label: t('magic.attack'), value: attackBonus }], exhaustion),
              })
            }
          />
        ) : null}
        {base ? (
          <SmallButton
            title={
              kind === 'heal'
                ? t('magic.heal', { value })
                : kind === 'tempHp'
                  ? t('magic.tempHp', { value })
                  : beams > 1
                    ? t('magic.beams', { count: beams, dice: value })
                    : t('combat.damage', { value })
            }
            tone={kind ? 'heal' : 'damage'}
            flex={1}
            onPress={() =>
              setDamage({
                title: kind
                  ? `${name}: ${t(kind === 'heal' ? 'magic.healTitle' : 'magic.tempHpTitle')}`
                  : t('combat.damageOf', { name }),
                dice: base.dice,
                bonus: total(base),
                damageType: kind ? undefined : damageTypeName(s.damage?.type),
                ...(kind ? { noCritical: true } : {}),
                ...(differ ? { variants } : {}),
                ...(note ? { note } : {}),
              })
            }
          />
        ) : null}
      </View>
    );
  };

  const spellRow = (
    id: string,
    canCast: boolean,
    extra?: ReactNode,
    attackBonus = sc?.attackBonus,
    classId?: string,
  ) => {
    const s = byId.spells.get(id);
    if (!s) {
      return null;
    }
    return (
      <Pressable
        key={id}
        accessibilityRole="button"
        onPress={() =>
          setInfo({
            title: localizeText(s.name).text,
            subtitle: spellMeta(s),
            text: spellDescription(s),
          })
        }
        style={({ pressed }) => [styles.spell, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.row}>
          <View style={styles.fillGap2}>
            <View style={styles.row}>
              <AppText style={styles.spellName}>{localizeText(s.name).text}</AppText>
              {s.concentration ? <Badge label={t('magic.concentrationBadge')} /> : null}
              {s.ritual ? <Badge label={t('magic.ritualBadge')} /> : null}
            </View>
            <AppText variant="secondary" style={styles.size13} numberOfLines={2}>
              {spellMeta(s)}
            </AppText>
          </View>
          {canCast && s.level > 0 ? (
            <SmallButton title={t('magic.cast')} tone="accent" onPress={() => cast(s, classId)} />
          ) : null}
          {extra}
        </View>
        {spellActions(s, attackBonus)}
      </Pressable>
    );
  };

  return (
    <Screen>
      {sc ? (
        <>
          {multi ? null : (
            <View style={styles.row}>
              <StatBox label={t('magic.saveDC', { ability: abilityAbbr(sc.ability) })} value={String(sc.saveDC)} />
              <StatBox
                label={t('magic.spellAttack')}
                value={formatModifier(sc.attackBonus)}
                accent
                onPress={() =>
                  setRoll({
                    title: t('magic.spellAttack'),
                    parts: d20Parts([{ label: t('magic.attack'), value: sc.attackBonus }], exhaustion),
                  })
                }
              />
            </View>
          )}

          <Card>
            <AppText variant="heading">{t('magic.slots')}</AppText>
            <AppText variant="secondary">{t('magic.slotsHint')}</AppText>
            {sc.slots.map((max, i) =>
              max > 0 ? (
                <DotRow
                  key={i}
                  label={t('spell.circle', { level: i + 1 })}
                  total={max}
                  filled={character.state.slotsSpent[i] ?? 0}
                  onPress={(dot) =>
                    updateState((s) => adjustSlot(s, i + 1, dot < (s.slotsSpent[i] ?? 0) ? -1 : 1, sc.slots))
                  }
                />
              ) : null,
            )}
            {pact ? (
              <>
                <AppText variant="heading">{t('magic.pactSlots')}</AppText>
                <AppText variant="secondary">{t('magic.pactSlotsHint')}</AppText>
                {pact.map((max, i) =>
                  max > 0 ? (
                    <DotRow
                      key={`pact-${i}`}
                      label={t('spell.circle', { level: i + 1 })}
                      total={max}
                      filled={character.state.pactSlotsSpent?.[i] ?? 0}
                      onPress={(dot) =>
                        updateState((s) => adjustPactSlot(s, i + 1, dot < (s.pactSlotsSpent?.[i] ?? 0) ? -1 : 1, pact))
                      }
                    />
                  ) : null,
                )}
              </>
            ) : null}
          </Card>

          {message ? <AppText style={styles.textAccent}>{message}</AppText> : null}

          {sheet.spellcastingClasses.map((cl) => {
            const lists = classSpellLists(character, content, cl.classId);
            // Волшебник: заклинания книги, которые сейчас не подготовлены.
            const reserve =
              cl.classId === 'wizard' && hasSpellbook(character)
                ? spellbook(character).filter((id) => !lists.preparedSpells.includes(id))
                : [];
            // 2014: заклинания подкласса (домен, клятва) — всегда подготовлены, в лимит не входят.
            const always = subclassSpellIds(
              { ...character, classes: character.classes.filter((e) => e.classId === cl.classId) },
              content,
            ).filter((id) => !lists.preparedSpells.includes(id));
            return (
              <View key={cl.classId} style={styles.section}>
                {multi ? (
                  <View style={styles.row}>
                    <View style={styles.fillGap2}>
                      <AppText variant="heading">{nameOf('classes', cl.classId)}</AppText>
                      <AppText variant="secondary">
                        {t('magic.classStats', {
                          ability: abilityAbbr(cl.ability),
                          dc: cl.saveDC,
                          attack: formatModifier(cl.attackBonus),
                        })}
                      </AppText>
                    </View>
                    <SmallButton
                      title={t('combat.attack', { value: formatModifier(cl.attackBonus) })}
                      tone="accent"
                      onPress={() =>
                        setRoll({
                          title: `${t('magic.spellAttack')}: ${nameOf('classes', cl.classId)}`,
                          parts: d20Parts([{ label: t('magic.attack'), value: cl.attackBonus }], exhaustion),
                        })
                      }
                    />
                  </View>
                ) : null}
                <SmallButton title={t('magic.editSpells')} onPress={() => setEditing(cl.classId)} />
                {lists.cantrips.length ? (
                  <View style={styles.section}>
                    <AppText variant={multi ? 'secondary' : 'heading'}>{t('magic.cantrips')}</AppText>
                    {lists.cantrips.map((id) => spellRow(id, true, undefined, cl.attackBonus, cl.classId))}
                  </View>
                ) : null}
                {lists.preparedSpells.length ? (
                  <View style={styles.section}>
                    <AppText variant={multi ? 'secondary' : 'heading'}>
                      {byId.classes.get(cl.classId)?.spellcasting?.preparation === 'known'
                        ? t('magic.known')
                        : t('magic.prepared')}
                    </AppText>
                    {lists.preparedSpells.map((id) => spellRow(id, true, undefined, cl.attackBonus, cl.classId))}
                  </View>
                ) : null}
                {always.length ? (
                  <View style={styles.section}>
                    <AppText variant={multi ? 'secondary' : 'heading'}>{t('magic.alwaysPrepared')}</AppText>
                    {always.map((id) => spellRow(id, true, undefined, cl.attackBonus, cl.classId))}
                  </View>
                ) : null}
                {reserve.length ? (
                  <View style={styles.section}>
                    <AppText variant={multi ? 'secondary' : 'heading'}>{t('magic.spellbook')}</AppText>
                    <AppText variant="secondary">{t('magic.spellbookHint')}</AppText>
                    {reserve.map((id) => spellRow(id, false, undefined, cl.attackBonus, cl.classId))}
                  </View>
                ) : null}
              </View>
            );
          })}
        </>
      ) : null}

      {initiates.map((mi) => (
        <View key={mi.slot} style={styles.section}>
          <AppText variant="heading">{nameOf('feats', 'magic-initiate')}</AppText>
          <AppText variant="secondary">
            {t('magic.initiateStats', {
              list: nameOf('classes', mi.list),
              ability: mi.ability ? abilityAbbr(mi.ability) : '—',
              dc: mi.dc,
              attack: formatModifier(mi.attack),
            })}
            {'\n'}
            {t('magic.initiateHint')}
          </AppText>
          {mi.spells.map((id) => spellRow(id, !!sc, undefined, mi.ability ? mi.attack : undefined))}
        </View>
      ))}

      {(['invocation', 'metamagic'] as const).map((kind) => {
        const chosen = chosenClassOptions(character, kind)
          .map((id) => byId.classOptions.get(id))
          .filter((o) => !!o);
        if (!chosen.length) {
          return null;
        }
        const spells = kind === 'invocation' ? classOptionSpells(character, content) : [];
        return (
          <View key={kind} style={styles.section}>
            <AppText variant="heading">{t(`classOptions.${kind}`)}</AppText>
            <AppText variant="secondary">
              {t(kind === 'invocation' ? 'magic.invocationsHint' : 'magic.metamagicHint')}
            </AppText>
            <ChipRow>
              {chosen.map((o) => (
                <Chip
                  key={o.id}
                  label={
                    o.cost
                      ? t('classOptions.withCost', { name: localizeText(o.name).text, count: o.cost })
                      : localizeText(o.name).text
                  }
                  onPress={() => setInfo({ title: localizeText(o.name).text, text: plain(o.description) })}
                />
              ))}
            </ChipRow>
            {spells.map((s) => {
              const left =
                s.free === 'longRest' ? 1 - Math.min(1, character.state.resourcesSpent[s.resourceKey] ?? 0) : 0;
              return (
                <View key={`${s.optionId}-${s.spellId}`}>
                  {spellRow(
                    s.spellId,
                    s.free === 'tome' && !!sc,
                    s.free === 'atWill' ? (
                      <SmallButton
                        title={t('magic.atWill')}
                        onPress={() => setMessage(t('magic.freeCast', { name: spellName(s.spellId) }))}
                      />
                    ) : s.free === 'longRest' ? (
                      <SmallButton
                        title={t('magic.free', { left })}
                        disabled={left === 0}
                        onPress={() => {
                          updateState((st) => adjustResource(st, s.resourceKey, 1, 1));
                          setMessage(t('magic.freeCast', { name: spellName(s.spellId) }));
                        }}
                      />
                    ) : null,
                    warlockAttack,
                    'warlock',
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      {species ? (
        <View style={styles.section}>
          <AppText variant="heading">{t('magic.species')}</AppText>
          <AppText variant="secondary">
            {species.ability
              ? t('magic.speciesStats', {
                  ability: abilityAbbr(species.ability),
                  dc: species.saveDC,
                  attack: formatModifier(species.attackBonus ?? 0),
                })
              : t('issues.speciesSpellAbility')}
            {'\n'}
            {t('magic.speciesHint')}
          </AppText>
          {species.spells.map((s) => {
            const left = s.freeUses - Math.min(s.freeUses, character.state.resourcesSpent[s.resourceKey] ?? 0);
            return spellRow(
              s.spellId,
              !!sc,
              s.freeUses ? (
                <SmallButton
                  title={t('magic.free', { left })}
                  disabled={left === 0}
                  onPress={() => {
                    updateState((st) => adjustResource(st, s.resourceKey, 1, s.freeUses));
                    setMessage(t('magic.freeCast', { name: spellName(s.spellId) }));
                  }}
                />
              ) : s.swapList ? (
                <SmallButton title={t('magic.swapCantrip')} onPress={() => setSwapping(s)} />
              ) : null,
              species.attackBonus,
            );
          })}
          {!sc && message ? <AppText style={styles.textAccent}>{message}</AppText> : null}
        </View>
      ) : null}

      <AppText variant="secondary">{t('magic.legend')}</AppText>

      <BottomSheet visible={!!swapping} title={t('magic.swapCantrip')} onClose={() => setSwapping(null)}>
        <AppText variant="secondary">{t('magic.swapCantripHint')}</AppText>
        {swapping?.swapList ? (
          <ChipRow>
            {spellOptions(swapping.swapList, 0, content).map((id) => (
              <Chip
                key={id}
                label={spellName(id)}
                selected={id === swapping.spellId}
                onPress={() => {
                  update((d) => ({
                    ...d,
                    choices: { ...d.choices, [CHOICE_KEYS.speciesCantrip(swapping.traitId)]: [id] },
                  }));
                  setSwapping({ ...swapping, spellId: id });
                }}
              />
            ))}
          </ChipRow>
        ) : null}
      </BottomSheet>

      <InfoSheet info={info} onClose={() => setInfo(null)} />
      <SpellsEditSheet
        visible={!!editing}
        classId={editing ?? undefined}
        character={character}
        onChange={update}
        onClose={() => setEditing(null)}
      />
      <D20Sheet request={roll} onClose={() => setRoll(null)} />
      <DamageSheet request={damage} onClose={() => setDamage(null)} />
    </Screen>
  );
}

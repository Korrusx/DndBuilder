import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import {
  ABILITY_IDS,
  characterResources,
  deathSave,
  EXHAUSTION_MAX,
  featureInfo,
  longRest,
  setExhaustion,
  speedWithExhaustion,
  toggleCondition,
  totalLevel,
} from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { MAX_LEVEL } from '@/features/level-up';
import { ShortRestSheet } from '@/features/rest';
import type { D20Request } from '@/features/roll-dice';
import { d20Parts, D20Sheet } from '@/features/roll-dice';
import { HpBlock } from '@/features/track-hp';
import { ResourcesCard } from '@/features/track-resources';
import { abilityAbbr, byId, content, nameOf, plain, localizeText } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatFeet, formatModifier, rollD20 } from '@/shared/lib/dice';
import type { InfoContent } from '@/shared/ui';
import { AppText, BottomSheet, Card, Chip, ChipRow, InfoSheet, Screen, SmallButton, StatBox } from '@/shared/ui';

import { styles } from './PlaySheetPage.styles';

export function PlaySheetPage() {
  const { character: c, sheet, update, updateState } = usePlay();
  const { t } = useTranslation();
  const [roll, setRoll] = useState<D20Request | null>(null);
  const [info, setInfo] = useState<(InfoContent & { conditionId?: string }) | null>(null);
  const [pickCondition, setPickCondition] = useState(false);
  const [shortRest, setShortRest] = useState(false);
  const resources = characterResources(c, content, sheet);

  const ex = c.state.exhaustion;
  const subtitle = [
    c.classes.map((e) => `${nameOf('classes', e.classId)} ${e.level}`).join(' / '),
    nameOf('species', c.speciesId),
    nameOf('backgrounds', c.backgroundId),
  ].join(' · ');

  const rollAbility = (id: (typeof ABILITY_IDS)[number], save: boolean) => {
    const a = sheet.abilities[id];
    const parts = [{ label: abilityAbbr(id), value: a.mod }];
    if (save && a.saveProficient) parts.push({ label: t('stats.pb'), value: sheet.profBonus });
    setRoll({ title: t('sheet.rollTitle', { kind: save ? t('sheet.save') : t('sheet.check'), ability: abilityAbbr(id) }), parts: d20Parts(parts, ex) });
  };

  const rollInitiative = () => {
    const parts = [{ label: abilityAbbr('dex'), value: sheet.abilities.dex.mod }];
    if (sheet.initiative !== sheet.abilities.dex.mod) parts.push({ label: nameOf('feats', 'alert'), value: sheet.initiative - sheet.abilities.dex.mod });
    setRoll({ title: t('stats.initiative'), parts: d20Parts(parts, ex) });
  };

  const rollDeathSave = () => {
    const parts = d20Parts([], ex);
    const modifier = parts.reduce((s, p) => s + p.value, 0);
    const r = rollD20(modifier);
    updateState((s) => deathSave(s, r.natural, r.total));
    setRoll({ title: t('sheet.deathSave'), parts, roll: r });
  };

  const confirmLongRest = () =>
    Alert.alert(t('rest.long'), t('sheet.longRestConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('sheet.rest'), onPress: () => updateState((s) => longRest(s, sheet.maxHp, c.edition, sheet.hitDice)) },
    ]);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <AppText variant="secondary" style={styles.fill}>
          {subtitle}
        </AppText>
        <Chip
          label={`${c.state.heroicInspiration ? '★' : '☆'} ${t('sheet.inspiration')}`}
          selected={c.state.heroicInspiration}
          onPress={() => updateState((s) => ({ ...s, heroicInspiration: !s.heroicInspiration }))}
        />
      </View>

      <HpBlock c={c} sheet={sheet} onDeathSave={rollDeathSave} />

      <View style={styles.row}>
        <StatBox label={t('stats.ac')} value={String(sheet.armorClass)} />
        <StatBox label={t('stats.initiative')} value={formatModifier(sheet.initiative)} onPress={rollInitiative} accent />
        <StatBox label={t('stats.speed')} value={`${speedWithExhaustion(sheet.speed, ex, c.edition)}`} />
        <StatBox label={t('stats.pb')} value={formatModifier(sheet.profBonus)} />
        <StatBox
          label={t('stats.passivePerception')}
          value={String(sheet.passivePerception)}
          onPress={() =>
            setInfo({
              title: t('stats.passivePerceptionFull'),
              text: t('sheet.passiveInfo', { bonus: formatModifier(sheet.passivePerception - 10) }),
            })
          }
        />
      </View>

      <View style={styles.grid}>
        {ABILITY_IDS.map((id) => {
          const a = sheet.abilities[id];
          return (
            <View key={id} style={styles.ability}>
              <Pressable accessibilityRole="button" onPress={() => rollAbility(id, false)} style={styles.abilityTop}>
                <AppText style={styles.abilityAbbr}>{abilityAbbr(id)}</AppText>
                <AppText style={styles.abilityMod}>{formatModifier(a.mod)}</AppText>
                <AppText style={styles.abilityScore}>{a.score}</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => rollAbility(id, true)}
                style={[styles.save, a.saveProficient && styles.saveProficient]}
              >
                <AppText style={[styles.saveText, a.saveProficient && styles.saveProficientText]}>
                  {t('sheet.saveShort', { value: formatModifier(a.save) })}
                  {a.saveProficient ? ' ●' : ''}
                </AppText>
              </Pressable>
            </View>
          );
        })}
      </View>

      <ResourcesCard resources={resources} />

      <Card>
        <AppText variant="heading">{t('sheet.conditions')}</AppText>
        <ChipRow>
          {c.state.conditions.map((id) => {
            const cond = byId.conditions.get(id);
            return (
              <Chip
                key={id}
                label={localizeText(cond?.name).text || id}
                selected
                onPress={() => setInfo({ title: localizeText(cond?.name).text, text: plain(cond?.description), conditionId: id })}
              />
            );
          })}
          <Chip label={t('sheet.addCondition')} onPress={() => setPickCondition(true)} />
        </ChipRow>
        <View style={styles.exhaustion}>
          <AppText style={styles.fill}>
            {t('sheet.exhaustion', { level: ex, max: EXHAUSTION_MAX })}
            {ex ? (
              <AppText variant="secondary">
                {c.edition === '2014'
                  ? `  (${t(`sheet.exhaustion2014.${ex}` as 'sheet.exhaustion2014.1')})`
                  : t('sheet.exhaustionEffect', { d20: t('roll.d20'), penalty: formatModifier(-2 * ex), speed: formatFeet(5 * ex) })}
              </AppText>
            ) : null}
          </AppText>
          <SmallButton title="−" disabled={ex === 0} onPress={() => updateState((s) => setExhaustion(s, s.exhaustion - 1))} />
          <SmallButton title="+" disabled={ex === EXHAUSTION_MAX} onPress={() => updateState((s) => setExhaustion(s, s.exhaustion + 1))} />
        </View>
      </Card>

      <Card>
        <AppText variant="heading">{t('sheet.features')}</AppText>
        <ChipRow>
          {sheet.features.map((f) => (
            <Chip key={`${f.source}-${f.id}`} label={featureInfo(f).title} onPress={() => setInfo(featureInfo(f))} />
          ))}
        </ChipRow>
      </Card>

      {totalLevel(c.classes) < MAX_LEVEL ? (
        <SmallButton
          title={t('sheet.levelUp', { from: totalLevel(c.classes), to: totalLevel(c.classes) + 1 })}
          tone="accent"
          onPress={() => router.navigate({ pathname: '/character/[id]/level-up', params: { id: c.id } })}
        />
      ) : null}

      <View style={styles.row}>
        <SmallButton title={t('rest.short')} flex={1} onPress={() => setShortRest(true)} />
        <SmallButton title={t('rest.long')} flex={1} onPress={confirmLongRest} />
      </View>

      <D20Sheet request={roll} onClose={() => setRoll(null)} />

      <InfoSheet info={info} onClose={() => setInfo(null)}>
        {info?.conditionId ? (
          <SmallButton
            title={t('sheet.removeCondition')}
            tone="accent"
            onPress={() => {
              updateState((s) => toggleCondition(s, info.conditionId!));
              setInfo(null);
            }}
          />
        ) : null}
      </InfoSheet>

      <BottomSheet visible={pickCondition} title={t('sheet.pickCondition')} onClose={() => setPickCondition(false)}>
        <ChipRow>
          {content.conditions
            .filter((x) => x.id !== 'exhaustion' && !c.state.conditions.includes(x.id))
            .map((x) => (
              <Chip
                key={x.id}
                label={localizeText(x.name).text}
                onPress={() => {
                  updateState((s) => toggleCondition(s, x.id));
                  setPickCondition(false);
                }}
              />
            ))}
        </ChipRow>
      </BottomSheet>

      <ShortRestSheet visible={shortRest} onClose={() => setShortRest(false)} />
    </Screen>
  );
}

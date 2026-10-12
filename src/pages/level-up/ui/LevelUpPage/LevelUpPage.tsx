import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import type { Character } from '@/entities/character';
import {
  choiceOptionIds,
  finalAbilityScores,
  knownLanguages,
  proficientSkills,
  weaponMasteryCount,
  weaponMasteryOptions,
} from '@/entities/character';
import { usePlay } from '@/entities/character/ui';
import { SpellsEditSheet } from '@/features/edit-spells';
import { ClassOptionsPicker } from '@/features/pick-class-options';
import {
  AsiPicker,
  clearLevelFeatChoices,
  featAbilityRule,
  finishLevelUp,
  levelFeat,
  levelFeatOptions,
  levelFeatProfKey,
  levelUpHpGain,
  levelUpIssues,
  levelUpPlan,
  startLevelUp,
} from '@/features/level-up';
import type { AbilityId } from '@/shared/content';
import { abilityAbbr, byId, content, nameOf, plain, proficiencyName, tr } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import type { InfoContent } from '@/shared/ui';
import {
  AppText,
  Button,
  Card,
  Chip,
  ChipRow,
  InfoSheet,
  MultiPick,
  OptionCard,
  Screen,
  Section,
  SmallButton,
} from '@/shared/ui';

import { styles } from './LevelUpPage.styles';

export function LevelUpPage() {
  const { character: prev, update } = usePlay();
  const { t } = useTranslation();
  const [next, setNext] = useState<Character>(() => startLevelUp(prev));
  const [info, setInfo] = useState<InfoContent | null>(null);
  const [spells, setSpells] = useState(false);

  // Каждый раз при открытии экрана начинаем с текущего персонажа.
  useFocusEffect(
    useCallback(() => {
      setNext(startLevelUp(prev));
    }, [prev]),
  );

  const set = (fn: (c: Character) => Character) => setNext((c) => fn(c));
  const plan = levelUpPlan(next, content);
  const issues = levelUpIssues(next, prev, content);
  const blocking = issues.filter((i) => i.blocking);
  const hpGain = levelUpHpGain(next, prev, content);
  const level = plan.toLevel;

  const finish = () => {
    update(() => finishLevelUp(next, prev, content));
    router.navigate({ pathname: '/character/[id]', params: { id: prev.id } });
  };

  // --- Черта уровня ---
  const feat = levelFeat(next, content, level);
  const featRule = feat ? featAbilityRule(feat.featId) : null;
  const setFeat = (featId: string | undefined) =>
    set((c) => {
      const others = c.feats.filter((f) => f !== levelFeat(c, content, level));
      const rule = featId ? featAbilityRule(featId) : null;
      const added = featId
        ? [{ featId, source: 'class' as const, level, abilityIncreases: {}, ...(rule?.mode === 'one' && rule.cap !== 20 ? { abilityCap: rule.cap } : {}) }]
        : [];
      return { ...clearLevelFeatChoices(c, level), feats: [...others, ...added] };
    });
  const setIncreases = (abilityIncreases: Partial<Record<AbilityId, number>>) =>
    set((c) => ({ ...c, feats: c.feats.map((f) => (f === levelFeat(c, content, level) ? { ...f, abilityIncreases } : f)) }));

  const scores = finalAbilityScores(prev);
  const featProfSlots: { key: string; choose: number; options: string[] }[] = !feat
    ? []
    : feat.featId === 'skilled'
      ? [
          {
            key: levelFeatProfKey(level, 'skilled', 0),
            choose: 3,
            options: content.proficiencies.filter((p) => ['skill', 'tool', 'artisanTool', 'instrument'].includes(p.type)).map((p) => p.id),
          },
        ]
      : (byId.feats.get(feat.featId)?.proficiencyChoices ?? []).map((ch, i) => ({
          key: levelFeatProfKey(level, feat.featId, i),
          choose: ch.choose,
          options: choiceOptionIds(ch, content),
        }));

  // Уже имеющиеся владения нельзя выбрать ещё раз.
  const owned = new Set<string>();
  for (const s of proficientSkills(prev, content)) owned.add(`skill-${s}`);
  const blocked = new Map([...owned].map((id) => [id, t('levelUpPage.owned')] as const));

  const newExpertise = next.expertise.filter((s) => !prev.expertise.includes(s));
  const expertiseOptions = proficientSkills(next, content).filter((s) => !prev.expertise.includes(s));
  const fightingStyleFeats = next.feats.filter((f) => f.level === level && byId.feats.get(f.featId)?.type === 'fighting-style');
  const takenStyles = new Set(prev.feats.map((f) => f.featId));
  const newLanguages = next.languages.filter((l) => !prev.languages.includes(l));
  const masteryCount = weaponMasteryCount(next, content);

  return (
    <Screen
      footer={
        <>
          {blocking[0] ? (
            <AppText variant="secondary" numberOfLines={2}>
              {blocking[0].message}
              {blocking.length > 1 ? t('wizard.moreIssues', { count: blocking.length - 1 }) : ''}
            </AppText>
          ) : null}
          <Button title={t('levelUpPage.finish', { level })} disabled={blocking.length > 0} onPress={finish} />
        </>
      }
    >
      <AppText variant="title">
        {nameOf('classes', plan.classId)}: {level - 1} → {level}
      </AppText>

      <Card style={styles.gapSm}>
        <AppText variant="heading">{t('levelUpPage.hp', { value: hpGain })}</AppText>
        <AppText variant="secondary">{t('levelUpPage.hpHint')}</AppText>
      </Card>

      {plan.features.length ? (
        <Section title={t('levelUpPage.newFeatures')} hint={t('levelUpPage.newFeaturesHint')}>
          <ChipRow>
            {plan.features.map((f) => {
              const feature = byId.features.get(f.id);
              return (
                <Chip
                  key={f.id}
                  label={nameOf('features', f.id)}
                  note={f.source === 'subclass' ? t('levelUpPage.subclassNote') : undefined}
                  onPress={() => setInfo({ title: nameOf('features', f.id), text: plain(feature?.description) })}
                />
              );
            })}
          </ChipRow>
        </Section>
      ) : null}

      {plan.needsSubclass ? (
        <Section title={t('levelUpPage.subclass')} picked={next.classes[0].subclassId ? 1 : 0} need={1}>
          {content.subclasses
            .filter((s) => s.classId === plan.classId)
            .map((s) => (
              <OptionCard
                key={s.id}
                title={tr(s.name).text}
                lines={[tr(s.summary).text, ...(s.extra ? [t('common.fromPhb')] : [])]}
                selected={next.classes[0].subclassId === s.id}
                onPress={() => set((c) => ({ ...c, classes: [{ ...c.classes[0], subclassId: s.id }, ...c.classes.slice(1)] }))}
              />
            ))}
        </Section>
      ) : null}

      {plan.featSlot ? (
        <Section
          title={plan.featSlot === 'asi' ? t('levelUpPage.asi') : t('levelUpPage.epicBoon')}
          hint={plan.featSlot === 'asi' ? t('levelUpPage.asiHint') : undefined}
          picked={feat ? 1 : 0}
          need={1}
        >
          <MultiPick
            options={levelFeatOptions(next, content, plan.featSlot)}
            selected={feat ? [feat.featId] : []}
            max={1}
            label={(id) => nameOf('feats', id)}
            onChange={([id]) => setFeat(id)}
          />
          {feat ? <AppText variant="secondary">{plain(byId.feats.get(feat.featId)?.description)}</AppText> : null}
          {featRule?.mode === 'asi' ? (
            <AsiPicker increases={feat?.abilityIncreases ?? {}} scores={scores} onChange={setIncreases} />
          ) : null}
          {featRule?.mode === 'one' ? (
            <ChipRow>
              {featRule.abilities.map((id) => (
                <Chip
                  key={id}
                  label={`${abilityAbbr(id)} +1`}
                  note={String(scores[id])}
                  disabled={scores[id] >= featRule.cap}
                  selected={feat?.abilityIncreases?.[id] === 1}
                  onPress={() => setIncreases({ [id]: 1 })}
                />
              ))}
            </ChipRow>
          ) : null}
          {featProfSlots.map((slot) => (
            <Section key={slot.key} title={t('levelUpPage.featProficiencies')} picked={next.choices[slot.key]?.length ?? 0} need={slot.choose}>
              <MultiPick
                options={slot.options}
                selected={next.choices[slot.key] ?? []}
                max={slot.choose}
                label={proficiencyName}
                blocked={blocked}
                onChange={(ids) => set((c) => ({ ...c, choices: { ...c.choices, [slot.key]: ids } }))}
              />
            </Section>
          ))}
        </Section>
      ) : null}

      {plan.expertise ? (
        <Section title={t('levelUpPage.expertise')} hint={t('levelUpPage.expertiseHint')} picked={newExpertise.length} need={plan.expertise}>
          <MultiPick
            options={expertiseOptions}
            selected={newExpertise}
            max={plan.expertise}
            label={(id) => nameOf('skills', id)}
            onChange={(ids) => set((c) => ({ ...c, expertise: [...prev.expertise, ...ids] }))}
          />
        </Section>
      ) : null}

      {plan.fightingStyles ? (
        <Section title={t('levelUpPage.fightingStyle')} picked={fightingStyleFeats.length} need={plan.fightingStyles}>
          <MultiPick
            options={content.feats.filter((f) => f.type === 'fighting-style' && !takenStyles.has(f.id)).map((f) => f.id)}
            selected={fightingStyleFeats.map((f) => f.featId)}
            max={plan.fightingStyles}
            label={(id) => nameOf('feats', id)}
            onChange={(ids) =>
              set((c) => ({
                ...c,
                feats: [
                  ...c.feats.filter((f) => !(f.level === level && byId.feats.get(f.featId)?.type === 'fighting-style')),
                  ...ids.map((featId) => ({ featId, source: 'class' as const, level })),
                ],
              }))
            }
          />
        </Section>
      ) : null}

      {plan.skillChoices.map((sc) => (
        <Section key={sc.key} title={t('levelUpPage.skills', { feature: nameOf('features', sc.featureId) })} picked={next.choices[sc.key]?.length ?? 0} need={sc.choose}>
          <MultiPick
            options={sc.options}
            selected={next.choices[sc.key] ?? []}
            max={sc.choose}
            label={proficiencyName}
            blocked={blocked}
            onChange={(ids) => set((c) => ({ ...c, choices: { ...c.choices, [sc.key]: ids } }))}
          />
        </Section>
      ))}

      <ClassOptionsPicker character={next} onChoice={(key, ids) => set((c) => ({ ...c, choices: { ...c.choices, [key]: ids } }))} />

      {plan.languages ? (
        <Section title={t('levelUpPage.languages')} picked={newLanguages.length} need={plan.languages}>
          <MultiPick
            options={content.languages.map((l) => l.id).filter((id) => !knownLanguages(prev, content).includes(id))}
            selected={newLanguages}
            max={plan.languages}
            label={(id) => nameOf('languages', id)}
            onChange={(ids) => set((c) => ({ ...c, languages: [...prev.languages, ...ids] }))}
          />
        </Section>
      ) : null}

      {masteryCount > prev.weaponMasteries.length ? (
        <Section title={t('levelUpPage.masteries')} picked={next.weaponMasteries.length} need={masteryCount}>
          <MultiPick
            options={weaponMasteryOptions(next, content)}
            selected={next.weaponMasteries}
            max={masteryCount}
            label={(id) => nameOf('equipment', id)}
            onChange={(weaponMasteries) => set((c) => ({ ...c, weaponMasteries }))}
          />
        </Section>
      ) : null}

      {issues
        .filter((i) => !i.blocking)
        .map((i) => (
          <View key={i.message} style={styles.gapSm}>
            <AppText style={styles.textInfo}>{i.message}</AppText>
            {i.action === 'spells' ? (
              <SmallButton title={t('levelUpPage.pickSpells')} tone="accent" onPress={() => setSpells(true)} />
            ) : null}
          </View>
        ))}

      <InfoSheet info={info} onClose={() => setInfo(null)} />
      <SpellsEditSheet
        visible={spells}
        character={next}
        onChange={(patch) => set((c) => ({ ...c, ...patch }))}
        onClose={() => setSpells(false)}
      />
    </Screen>
  );
}

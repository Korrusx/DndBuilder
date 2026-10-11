import { choiceOptionIds, proficientSkills, weaponMasteryCount, weaponMasteryOptions } from '@/entities/character/model/build';
import { usePlay } from '@/entities/character/model/CharacterContext';
import { finalAbilityScores } from '@/entities/character/model/sheet';
import type { Character } from '@/entities/character/model/types';
import { SpellsEditSheet } from '@/features/edit-spells/ui/SpellsEditSheet/SpellsEditSheet';
import { clearLevelFeatChoices, featAbilityRule, finishLevelUp, levelFeat, levelFeatOptions, levelFeatProfKey, levelUpHpGain, levelUpIssues, levelUpPlan, startLevelUp } from '@/features/level-up/model/levelup';
import { AsiPicker } from '@/features/level-up/ui/AsiPicker/AsiPicker';
import { colors, spacing } from '@/shared/config/theme';
import { byId, content, tr } from '@/shared/content/content';
import { abilityAbbr, nameOf, proficiencyName } from '@/shared/content/names';
import { plain } from '@/shared/content/plain';
import type { AbilityId } from '@/shared/content/types';
import { AppText } from '@/shared/ui/AppText/AppText';
import { Button } from '@/shared/ui/Button/Button';
import { Card } from '@/shared/ui/Card/Card';
import { Chip } from '@/shared/ui/Chip/Chip';
import { ChipRow } from '@/shared/ui/ChipRow/ChipRow';
import { InfoSheet } from '@/shared/ui/InfoSheet/InfoSheet';
import type { InfoContent } from '@/shared/ui/InfoSheet/InfoSheet.types';
import { MultiPick } from '@/shared/ui/MultiPick/MultiPick';
import { OptionCard } from '@/shared/ui/OptionCard/OptionCard';
import { Screen } from '@/shared/ui/Screen/Screen';
import { Section } from '@/shared/ui/Section/Section';
import { SmallButton } from '@/shared/ui/SmallButton/SmallButton';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

export function LevelUpPage() {
  const { character: prev, update } = usePlay();
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
  const blocked = new Map([...owned].map((id) => [id, 'уже есть'] as const));

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
              {blocking.length > 1 ? ` (и ещё ${blocking.length - 1})` : ''}
            </AppText>
          ) : null}
          <Button title={`Повысить до ${level} уровня`} disabled={blocking.length > 0} onPress={finish} />
        </>
      }
    >
      <AppText variant="title">
        {nameOf('classes', plan.classId)}: {level - 1} → {level}
      </AppText>

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="heading">Хиты: +{hpGain}</AppText>
        <AppText variant="secondary">Среднее значение кости хитов + модификатор Телосложения (и прибавки от черт и умений).</AppText>
      </Card>

      {plan.features.length ? (
        <Section title="Новые умения" hint="Нажмите, чтобы прочитать описание.">
          <ChipRow>
            {plan.features.map((f) => {
              const feature = byId.features.get(f.id);
              return (
                <Chip
                  key={f.id}
                  label={nameOf('features', f.id)}
                  note={f.source === 'subclass' ? 'подкласс' : undefined}
                  onPress={() => setInfo({ title: nameOf('features', f.id), text: plain(feature?.description) })}
                />
              );
            })}
          </ChipRow>
        </Section>
      ) : null}

      {plan.needsSubclass ? (
        <Section title="Подкласс" picked={next.classes[0].subclassId ? 1 : 0} need={1}>
          {content.subclasses
            .filter((s) => s.classId === plan.classId)
            .map((s) => (
              <OptionCard
                key={s.id}
                title={tr(s.name).text}
                lines={[tr(s.summary).text, ...(s.extra ? ["Из Player's Handbook 2024 (не SRD)"] : [])]}
                selected={next.classes[0].subclassId === s.id}
                onPress={() => set((c) => ({ ...c, classes: [{ ...c.classes[0], subclassId: s.id }, ...c.classes.slice(1)] }))}
              />
            ))}
        </Section>
      ) : null}

      {plan.featSlot ? (
        <Section
          title={plan.featSlot === 'asi' ? 'Увеличение характеристик или черта' : 'Эпический дар'}
          hint={plan.featSlot === 'asi' ? '«Увеличение характеристик»: +2 к одной или +1 к двум (не выше 20). Или другая черта.' : undefined}
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
            <Section key={slot.key} title="Владения черты" picked={next.choices[slot.key]?.length ?? 0} need={slot.choose}>
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
        <Section title="Компетентность" hint="Бонус мастерства удваивается для этих навыков." picked={newExpertise.length} need={plan.expertise}>
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
        <Section title="Боевой стиль" picked={fightingStyleFeats.length} need={plan.fightingStyles}>
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
        <Section key={sc.key} title={`Навыки: ${nameOf('features', sc.featureId)}`} picked={next.choices[sc.key]?.length ?? 0} need={sc.choose}>
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

      {plan.languages ? (
        <Section title="Языки" picked={newLanguages.length} need={plan.languages}>
          <MultiPick
            options={content.languages.map((l) => l.id).filter((id) => !prev.languages.includes(id))}
            selected={newLanguages}
            max={plan.languages}
            label={(id) => nameOf('languages', id)}
            onChange={(ids) => set((c) => ({ ...c, languages: [...prev.languages, ...ids] }))}
          />
        </Section>
      ) : null}

      {masteryCount > prev.weaponMasteries.length ? (
        <Section title="Приёмы оружия" picked={next.weaponMasteries.length} need={masteryCount}>
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
          <View key={i.message} style={{ gap: spacing.sm }}>
            <AppText style={{ color: colors.info }}>{i.message}</AppText>
            {i.message.startsWith('Можно выбрать ещё заклинаний') ? (
              <SmallButton title="Выбрать заклинания" tone="accent" onPress={() => setSpells(true)} />
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

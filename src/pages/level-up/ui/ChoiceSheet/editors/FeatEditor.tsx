import { View } from 'react-native';

import { choiceOptionIds, featEntries, finalAbilityScores } from '@/entities/character';
import {
  AsiPicker,
  clearLevelFeatChoices,
  featAbilityRule,
  levelFeat,
  levelFeatOptions,
  levelFeatProfKey,
  levelUpPlan,
} from '@/features/level-up';
import type { AbilityId } from '@/shared/content';
import { abilityAbbr, byId, content, proficiencyName } from '@/shared/content';
import { t } from '@/shared/i18n';
import { Chip, ChipRow, ChoiceField, MultiPick, Section } from '@/shared/ui';

import { styles } from './editors.styles';
import type { EditorProps } from './editors.types';

/** Улучшение характеристик, черта или эпический дар — с прибавками и владениями черты. */
export function FeatEditor({ choice, prev, next, set }: EditorProps) {
  const plan = levelUpPlan(next, content, choice.classId);
  const level = plan.charLevel;
  const feat = levelFeat(next, content, level);
  const rule = feat ? featAbilityRule(feat.featId, content) : null;
  const scores = finalAbilityScores(prev, content);

  const setFeat = (featId: string | undefined) =>
    set((c) => {
      const others = c.feats.filter((f) => f !== levelFeat(c, content, level));
      const featRule = featId ? featAbilityRule(featId, content) : null;
      const added = featId
        ? [
            {
              featId,
              source: 'class' as const,
              level,
              abilityIncreases: {},
              ...(featRule?.mode === 'one' && featRule.cap !== 20 ? { abilityCap: featRule.cap } : {}),
            },
          ]
        : [];
      return { ...clearLevelFeatChoices(c, level), feats: [...others, ...added] };
    });
  const setIncreases = (abilityIncreases: Partial<Record<AbilityId, number>>) =>
    set((c) => ({
      ...c,
      feats: c.feats.map((f) => (f === levelFeat(c, content, level) ? { ...f, abilityIncreases } : f)),
    }));

  const profSlots = !feat
    ? []
    : feat.featId === 'skilled'
      ? [
          {
            key: levelFeatProfKey(level, 'skilled', 0),
            choose: 3,
            options: content.proficiencies
              .filter((p) => ['skill', 'tool', 'artisanTool', 'instrument'].includes(p.type))
              .map((p) => p.id),
          },
        ]
      : (byId.feats.get(feat.featId)?.proficiencyChoices ?? []).map((ch, i) => ({
          key: levelFeatProfKey(level, feat.featId, i),
          choose: ch.choose,
          options: choiceOptionIds(ch, content),
        }));

  return (
    <View style={styles.gap}>
      <ChoiceField
        title={t('levelUpPage.feat')}
        entries={featEntries(levelFeatOptions(next, content, choice.featSlot ?? 'asi'), content)}
        selected={feat ? [feat.featId] : []}
        max={1}
        onChange={([id]) => setFeat(id)}
      />
      {rule?.mode === 'asi' ? (
        <AsiPicker increases={feat?.abilityIncreases ?? {}} scores={scores} onChange={setIncreases} />
      ) : null}
      {rule?.mode === 'one' ? (
        <ChipRow>
          {rule.abilities.map((id) => (
            <Chip
              key={id}
              label={`${abilityAbbr(id)} +1`}
              note={String(scores[id])}
              disabled={scores[id] >= rule.cap}
              selected={feat?.abilityIncreases?.[id] === 1}
              onPress={() => setIncreases({ [id]: 1 })}
            />
          ))}
        </ChipRow>
      ) : null}
      {profSlots.map((slot) => (
        <Section
          key={slot.key}
          title={t('levelUpPage.featProficiencies')}
          picked={next.choices[slot.key]?.length ?? 0}
          need={slot.choose}
        >
          <MultiPick
            options={slot.options}
            selected={next.choices[slot.key] ?? []}
            max={slot.choose}
            label={proficiencyName}
            onChange={(ids) => set((c) => ({ ...c, choices: { ...c.choices, [slot.key]: ids } }))}
          />
        </Section>
      ))}
    </View>
  );
}

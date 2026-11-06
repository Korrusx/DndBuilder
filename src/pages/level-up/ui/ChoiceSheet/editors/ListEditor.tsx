import {
  CHOICE_KEYS,
  featEntries,
  FEATURE_OPTIONS,
  featureEntries,
  featureOptionEntries,
  masteryEntries,
  weaponMasteryCount,
  weaponMasteryOptions,
} from '@/entities/character';
import { levelUpPlan } from '@/features/level-up';
import { byId, content } from '@/shared/content';
import { t } from '@/shared/i18n';
import { ChoiceField } from '@/shared/ui';

import type { EditorProps } from './editors.types';

/** Выбор из списка: вариант умения, умения-варианты 2014, стиль боя, приёмы оружия. */
export function ListEditor({ choice, prev, next, set }: EditorProps) {
  const plan = levelUpPlan(next, content, choice.classId);
  const level = plan.charLevel;
  const setKey = (key: string, ids: string[]) => set((c) => ({ ...c, choices: { ...c.choices, [key]: ids } }));

  if (choice.kind === 'featureOption' && choice.featureId) {
    const key = CHOICE_KEYS.featureOption(choice.featureId);
    return (
      <ChoiceField
        title={t('levelUpDeck.choiceKind.featureOption')}
        entries={featureOptionEntries(FEATURE_OPTIONS[choice.featureId])}
        selected={next.choices[key] ?? []}
        max={1}
        onChange={(ids) => setKey(key, ids)}
      />
    );
  }
  if (choice.kind === 'optionChoice' || (choice.kind === 'replaceOption' && !choice.optionKind)) {
    const option = plan.optionChoices.find((o) => o.key === choice.key);
    return option ? (
      <ChoiceField
        title={t('levelUpDeck.choiceKind.optionChoice')}
        entries={featureEntries(option.options, content)}
        selected={next.choices[option.key] ?? []}
        max={option.total}
        onChange={(ids) => setKey(option.key, ids)}
      />
    ) : null;
  }
  if (choice.kind === 'fightingStyle') {
    const taken = new Set(prev.feats.map((f) => f.featId));
    const isStyle = (featId: string) => byId.feats.get(featId)?.type === 'fighting-style';
    return (
      <ChoiceField
        title={t('levelUpPage.fightingStyle')}
        entries={featEntries(
          content.feats.filter((f) => f.type === 'fighting-style' && !taken.has(f.id)).map((f) => f.id),
          content,
        )}
        selected={next.feats.filter((f) => f.level === level && isStyle(f.featId)).map((f) => f.featId)}
        max={plan.fightingStyles}
        onChange={(ids) =>
          set((c) => ({
            ...c,
            feats: [
              ...c.feats.filter((feat) => !(feat.level === level && isStyle(feat.featId))),
              ...ids.map((featId) => ({ featId, source: 'class' as const, level })),
            ],
          }))
        }
      />
    );
  }
  if (choice.kind === 'masteries') {
    return (
      <ChoiceField
        title={t('levelUpPage.masteries')}
        entries={masteryEntries(weaponMasteryOptions(next, content), content)}
        selected={next.weaponMasteries}
        max={weaponMasteryCount(next, content)}
        onChange={(weaponMasteries) => set((c) => ({ ...c, weaponMasteries }))}
      />
    );
  }
  return null;
}

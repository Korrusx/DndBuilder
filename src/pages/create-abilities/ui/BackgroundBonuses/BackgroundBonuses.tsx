import type { AbilityScores } from '@/entities/character';
import { backgroundBonusPattern } from '@/entities/character';
import { useDraft } from '@/features/create-character';
import type { AbilityId } from '@/shared/content';
import { abilityAbbr, nameOf } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, Chip, ChipRow, Hint, Section, Segmented } from '@/shared/ui';

import { styles } from './BackgroundBonuses.styles';
import type { BackgroundBonusesProps } from './BackgroundBonuses.types';

export function BackgroundBonuses({ c, allowed }: BackgroundBonusesProps) {
  const { update } = useDraft();
  const { t } = useTranslation();
  const pattern = backgroundBonusPattern(c.backgroundBonuses);
  const plus2 = allowed.find((id) => c.backgroundBonuses[id] === 2);
  const plus1 = allowed.find((id) => c.backgroundBonuses[id] === 1);
  const set = (bonuses: Partial<AbilityScores>) => update((d) => ({ ...d, backgroundBonuses: bonuses }));

  const pick = (value: 2 | 1, id: AbilityId) => {
    const next: Partial<AbilityScores> = {};
    const two = value === 2 ? id : plus2 === id ? undefined : plus2;
    const one = value === 1 ? id : plus1 === id ? undefined : plus1;
    if (two) next[two] = 2;
    if (one && one !== two) next[one] = 1;
    set(next);
  };

  return (
    <Section title={t('abilities.bgBonuses')}>
      <Hint>
        {t('abilities.bgHint', { background: nameOf('backgrounds', c.backgroundId), abilities: allowed.map(abilityAbbr).join(', ') })}
      </Hint>
      <Segmented<'2-1' | '1-1-1'>
        value={pattern}
        onChange={(p) => set(p === '1-1-1' ? Object.fromEntries(allowed.map((id) => [id, 1])) : {})}
        options={[
          { value: '2-1', label: t('abilities.twoOne') },
          { value: '1-1-1', label: t('abilities.oneOneOne') },
        ]}
      />
      {pattern === '2-1' ? (
        <>
          <ChipRow>
            <AppText style={styles.bonusLabel}>+2</AppText>
            {allowed.map((id) => (
              <Chip key={id} label={abilityAbbr(id)} selected={plus2 === id} onPress={() => pick(2, id)} />
            ))}
          </ChipRow>
          <ChipRow>
            <AppText style={styles.bonusLabel}>+1</AppText>
            {allowed.map((id) => (
              <Chip key={id} label={abilityAbbr(id)} selected={plus1 === id} onPress={() => pick(1, id)} />
            ))}
          </ChipRow>
        </>
      ) : null}
    </Section>
  );
}

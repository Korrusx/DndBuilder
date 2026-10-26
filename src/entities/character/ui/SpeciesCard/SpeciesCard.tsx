import type { AbilityId } from '@/shared/content';
import { abilityAbbr, nameOf, sizeName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatFeet, formatModifier } from '@/shared/lib/dice';
import { AppText, ChipRow, ExpandableRow, Pill } from '@/shared/ui';

import { DEFAULT_SPECIES_ICON, SPECIES_ICONS } from '../../config/icons';
import { DescriptionBlock, DescriptionCard } from '../DescriptionCard/DescriptionCard';
import type { SpeciesCardProps } from './SpeciesCard.types';

/** Что даёт вид / раса: суть, размер, скорость, тёмное зрение, прибавки (2014), особенности. */
export function SpeciesCard({ description, footer }: SpeciesCardProps) {
  const { t } = useTranslation();
  const bonuses = Object.entries(description.abilityBonuses ?? {})
    .map(([id, value]) => `${abilityAbbr(id as AbilityId)} ${formatModifier(value)}`)
    .join(', ');
  return (
    <DescriptionCard
      icon={SPECIES_ICONS[description.id] ?? DEFAULT_SPECIES_ICON}
      title={description.subspecies ? `${description.name} · ${description.subspecies.name}` : description.name}
      subtitle={description.pitch}
      badge={description.extra ? t('describe.notSrd') : undefined}
      footer={footer}
    >
      <ChipRow>
        <Pill label={description.sizes.map(sizeName).join(` ${t('common.or')} `)} />
        <Pill label={t('describe.speed', { speed: formatFeet(description.speed) })} />
        {description.darkvision ? (
          <Pill label={t('describe.darkvision', { range: formatFeet(description.darkvision) })} />
        ) : null}
        {bonuses ? <Pill accent label={bonuses} /> : null}
        {description.abilityBonusChoice ? (
          <Pill
            accent
            label={t('describe.bonusChoice', {
              bonus: description.abilityBonusChoice.bonus,
              count: description.abilityBonusChoice.choose,
            })}
          />
        ) : null}
      </ChipRow>

      {description.languages.length || description.languageChoice ? (
        <DescriptionBlock title={t('describe.languages')}>
          <AppText>
            {[
              ...description.languages.map((id) => nameOf('languages', id)),
              ...(description.languageChoice
                ? [t('describe.languagesValue', { count: description.languageChoice })]
                : []),
            ].join(', ')}
          </AppText>
        </DescriptionBlock>
      ) : null}

      {description.traits.length ? (
        <DescriptionBlock title={t('describe.traits')}>
          {description.traits.map((trait) => (
            <ExpandableRow
              key={trait.id}
              title={trait.name}
              summary={trait.summary}
              text={trait.text}
              note={trait.level ? t('describe.fromLevel', { level: trait.level }) : undefined}
            />
          ))}
        </DescriptionBlock>
      ) : null}
    </DescriptionCard>
  );
}

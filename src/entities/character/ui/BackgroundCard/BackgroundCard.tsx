import { abilityAbbr, proficiencyName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText, ChipRow, ExpandableRow, Pill } from '@/shared/ui';

import { BACKGROUND_ICONS, DEFAULT_BACKGROUND_ICON } from '../../config/icons';
import { InfoLine } from '../InfoLine/InfoLine';
import { DescriptionBlock, DescriptionCard } from '../DescriptionCard/DescriptionCard';
import type { BackgroundCardProps } from './BackgroundCard.types';

/** Что даёт предыстория: характеристики и черта (2024), навыки, инструменты, снаряжение; 2014 — языки и умение. */
export function BackgroundCard({ description, classDative, footer }: BackgroundCardProps) {
  const { t } = useTranslation();
  const tools = [...description.tools.map(proficiencyName), ...description.toolChoices];
  return (
    <DescriptionCard
      icon={BACKGROUND_ICONS[description.id] ?? DEFAULT_BACKGROUND_ICON}
      title={description.name}
      subtitle={description.pitch}
      badge={description.extra ? t('describe.notSrd') : undefined}
      footer={footer}
    >
      {description.fit && classDative ? (
        <ChipRow>
          <Pill
            accent
            label={t('describe.fits', {
              cls: classDative,
              ability: t(`describe.abilityDative.${description.fit.ability}`),
            })}
          />
        </ChipRow>
      ) : null}

      <DescriptionBlock title={t('describe.gives')}>
        {description.abilities.length ? (
          <InfoLine label={t('describe.abilities')}>
            {t('describe.abilitiesValue', { list: description.abilities.map(abilityAbbr).join(', ') })}
          </InfoLine>
        ) : null}
        {description.skills.length ? (
          <InfoLine label={t('describe.skills')}>{description.skills.map(proficiencyName).join(', ')}</InfoLine>
        ) : null}
        {tools.length ? <InfoLine label={t('describe.tools')}>{tools.join(', ')}</InfoLine> : null}
        {description.languages ? (
          <InfoLine label={t('describe.languages')}>
            {t('describe.languagesValue', { count: description.languages })}
          </InfoLine>
        ) : null}
        {description.equipment ? (
          <InfoLine label={t('describe.equipment')}>
            <AppText variant="secondary">{description.equipment}</AppText>
          </InfoLine>
        ) : null}
      </DescriptionBlock>

      {description.feat ? (
        <DescriptionBlock title={t('describe.originFeat')}>
          <ExpandableRow
            title={description.feat.name}
            summary={description.feat.summary}
            text={description.feat.text}
          />
        </DescriptionBlock>
      ) : null}

      {description.feature ? (
        <DescriptionBlock title={t('describe.backgroundFeature')}>
          <ExpandableRow
            title={description.feature.name}
            summary={description.feature.summary}
            text={description.feature.text}
          />
        </DescriptionBlock>
      ) : null}
    </DescriptionCard>
  );
}

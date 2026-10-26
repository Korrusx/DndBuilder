import { View } from 'react-native';

import { abilityAbbr, proficiencyName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDie } from '@/shared/lib/dice';
import { AppText, ChipRow, ExpandableRow, Pill } from '@/shared/ui';

import { CLASS_ICONS, DEFAULT_CLASS_ICON } from '../../config/icons';
import { DescriptionBlock, DescriptionCard } from '../DescriptionCard/DescriptionCard';
import { styles } from './ClassCard.styles';
import type { ClassCardProps } from './ClassCard.types';

/** Что умеет класс: роль, сложность, чипы, умения 1-го уровня, «что дальше», навыки. */
export function ClassCard({ description, footer }: ClassCardProps) {
  const { t } = useTranslation();
  const join = (ids: string[], separator = ', ') => ids.join(separator);
  const primary = description.primaryAbilities
    .map(abilityAbbr)
    .join(` ${description.primaryAbilityChoice ? t('common.or') : t('common.and')} `);
  const difficulty = (
    <View style={styles.difficulty} accessibilityLabel={t('describe.difficulty', { level: description.difficulty })}>
      <View style={styles.dots}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={[styles.dot, n <= description.difficulty && styles.dotFilled]} />
        ))}
      </View>
      <AppText variant="secondary" style={styles.difficultyLabel}>
        {t(`describe.difficultyLabel.${description.difficulty}`)}
      </AppText>
    </View>
  );
  return (
    <DescriptionCard
      icon={CLASS_ICONS[description.id] ?? DEFAULT_CLASS_ICON}
      title={description.name}
      subtitle={description.role}
      aside={difficulty}
      badge={description.extra ? t('describe.notSrd') : undefined}
      footer={footer}
    >
      {description.pitch ? <AppText style={styles.pitch}>{description.pitch}</AppText> : null}

      <ChipRow>
        <Pill label={t('describe.hitDie', { die: formatDie(description.hitDie) })} />
        <Pill label={t('describe.primary', { list: primary })} />
        {description.savingThrows.length ? (
          <Pill label={t('describe.saves', { list: join(description.savingThrows.map(abilityAbbr)) })} />
        ) : null}
        <Pill
          label={
            description.armor.length
              ? t('describe.armor', { list: join(description.armor.map(proficiencyName)) })
              : t('describe.noArmor')
          }
        />
      </ChipRow>

      <DescriptionBlock title={t('describe.firstLevel')}>
        {description.firstLevel.map((feature) => (
          <ExpandableRow key={feature.id} title={feature.name} summary={feature.summary} text={feature.text} />
        ))}
      </DescriptionBlock>

      {description.subclass ? (
        <DescriptionBlock title={t('describe.subclass', { name: description.subclass.name })}>
          {description.subclass.summary ? <AppText variant="secondary">{description.subclass.summary}</AppText> : null}
          {description.subclass.features.map((feature) => (
            <ExpandableRow key={feature.id} title={feature.name} summary={feature.summary} text={feature.text} />
          ))}
        </DescriptionBlock>
      ) : null}

      {description.next.length ? (
        <DescriptionBlock title={t('describe.next')}>
          {description.next.map((row) => (
            <View key={row.level} style={styles.nextRow}>
              <AppText style={styles.nextLevel}>{t('describe.level', { level: row.level })}</AppText>
              <AppText style={styles.nextText}>
                {row.subclass ? (
                  <AppText style={styles.subclassTag}>{`${t('describe.subclassTag')} · `}</AppText>
                ) : null}
                {join(row.features)}
              </AppText>
            </View>
          ))}
        </DescriptionBlock>
      ) : null}

      {description.skills ? (
        <DescriptionBlock title={t('describe.skills')}>
          <AppText>
            {t('describe.skillsChoose', {
              count: description.skills.choose,
              list: join(description.skills.options.map(proficiencyName)),
            })}
          </AppText>
        </DescriptionBlock>
      ) : null}
    </DescriptionCard>
  );
}

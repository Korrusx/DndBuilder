import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';
import { AppText, ExpandableRow } from '@/shared/ui';

import { CLASS_ICONS, DEFAULT_CLASS_ICON } from '../../config/icons';
import { DescriptionBlock, DescriptionCard } from '../DescriptionCard/DescriptionCard';
import { styles } from './SubclassCard.styles';
import type { SubclassCardProps } from './SubclassCard.types';

/** Что даёт подкласс: суть, умения текущего уровня, «что дальше», заклинания подкласса (2014). */
export function SubclassCard({ description }: SubclassCardProps) {
  const { t } = useTranslation();
  const levelRows = (rows: { level: number; names: string[] }[]) =>
    rows.map((row) => (
      <View key={row.level} style={styles.nextRow}>
        <AppText style={styles.nextLevel}>{t('describe.level', { level: row.level })}</AppText>
        <AppText style={styles.nextText}>{row.names.join(', ')}</AppText>
      </View>
    ));
  return (
    <DescriptionCard
      icon={CLASS_ICONS[description.classId] ?? DEFAULT_CLASS_ICON}
      title={description.name}
      subtitle={description.summary}
      badge={description.extra ? t('describe.notSrd') : undefined}
    >
      {description.pitch ? <AppText style={styles.pitch}>{description.pitch}</AppText> : null}

      {description.now.length ? (
        <DescriptionBlock title={t('describe.atLevel', { level: description.level })}>
          {description.now.map((feature) => (
            <ExpandableRow key={feature.id} title={feature.name} summary={feature.summary} text={feature.text} />
          ))}
        </DescriptionBlock>
      ) : null}

      {description.spells.length ? (
        <DescriptionBlock title={t('describe.subclassSpells')}>{levelRows(description.spells)}</DescriptionBlock>
      ) : null}

      {description.next.length ? (
        <DescriptionBlock title={t('describe.next')}>{levelRows(description.next)}</DescriptionBlock>
      ) : null}
    </DescriptionCard>
  );
}

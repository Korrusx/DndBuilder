import { View } from 'react-native';

import type { Edition } from '@/shared/content';
import { contentFor, translationProgress } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { AppText } from '@/shared/ui';

import { styles } from './AboutPage.styles';

type Props = { edition: Edition };

export function ReferenceCard({ edition }: Props) {
  const { t } = useTranslation();
  const content = contentFor(edition);
  const { done, total } = translationProgress(content);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const counts = {
    classes: content.classes.length,
    species: content.species.length,
    backgrounds: content.backgrounds.length,
    spells: content.spells.length,
    items: content.equipment.length,
    magicItems: content.magicItems.length,
  };

  return (
    <View style={styles.card}>
      <AppText>{t(edition === '2024' ? 'about.edition2024' : 'about.edition2014')}</AppText>
      <AppText variant="secondary">{t(edition === '2024' ? 'about.counts' : 'about.counts2014', counts)}</AppText>
      <AppText variant="secondary">{t('about.translated', { done, total, percent })}</AppText>
      <AppText variant="secondary" style={styles.build}>
        {t('about.build', { build: content.version })}
      </AppText>
    </View>
  );
}

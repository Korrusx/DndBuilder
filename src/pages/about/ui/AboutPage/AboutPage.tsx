import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';

import { DiceSettingsSection } from '@/features/roll-dice';
import { contentFor } from '@/shared/content';
import type { Language } from '@/shared/i18n';
import { LANGUAGES, setLanguage, useTranslation } from '@/shared/i18n';
import { AppText, Screen, Segmented } from '@/shared/ui';

import { extraCount } from '../../lib/extraCount';
import { ReferenceCard } from './ReferenceCard';
import { styles } from './AboutPage.styles';

export function AboutPage() {
  const db = useSQLiteContext();
  // Подписка на смену языка: страница перерисуется сразу после переключения.
  const { t, i18n } = useTranslation();
  const c2024 = contentFor('2024');
  const c2014 = contentFor('2014');

  return (
    <Screen>
      <AppText variant="heading">{t('language.title')}</AppText>
      <Segmented<Language>
        options={LANGUAGES}
        value={i18n.language as Language}
        onChange={(lang) => setLanguage(db, lang)}
      />
      <AppText variant="secondary">{t('language.hint')}</AppText>

      <DiceSettingsSection />

      <AppText variant="heading">{t('about.reference')}</AppText>
      <ReferenceCard edition="2024" />
      <ReferenceCard edition="2014" />

      <AppText variant="heading">{t('about.attribution')}</AppText>
      <AppText>{t('about.srd')}</AppText>
      <AppText>{t('about.srd51')}</AppText>
      <AppText variant="secondary">{t('about.ownTranslation')}</AppText>
      <AppText variant="secondary">
        {t('about.extra', {
          backgrounds: extraCount(c2024.backgrounds),
          feats: extraCount(c2024.feats),
          subclasses: extraCount(c2024.subclasses),
          species: extraCount(c2024.species),
        })}
      </AppText>
      <AppText variant="secondary">
        {t('about.extra2014', {
          backgrounds: extraCount(c2014.backgrounds),
          feats: extraCount(c2014.feats),
          subclasses: extraCount(c2014.subclasses),
          species: extraCount(c2014.species),
        })}
      </AppText>
      <AppText variant="secondary">{t('about.icons')}</AppText>
      <AppText variant="secondary">{t('about.dice3d')}</AppText>

      <AppText variant="secondary" style={styles.build}>
        {t('about.appVersion', { version: Constants.expoConfig?.version ?? '—' })}
      </AppText>
    </Screen>
  );
}

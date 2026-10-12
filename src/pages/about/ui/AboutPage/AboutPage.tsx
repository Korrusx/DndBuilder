import { useSQLiteContext } from 'expo-sqlite';
import { View } from 'react-native';

import { content, translationProgress } from '@/shared/content';
import type { Language } from '@/shared/i18n';
import { LANGUAGES, setLanguage, useTranslation } from '@/shared/i18n';
import { AppText, LText, Screen, Segmented } from '@/shared/ui';

import { styles } from './AboutPage.styles';

export function AboutPage() {
  const db = useSQLiteContext();
  // Подписка на смену языка: страница перерисуется сразу после переключения.
  const { t, i18n } = useTranslation();
  const { done, total } = translationProgress();
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <Screen>
      <AppText variant="heading">{t('language.title')}</AppText>
      <Segmented<Language> options={LANGUAGES} value={i18n.language as Language} onChange={(lang) => setLanguage(db, lang)} />
      <AppText variant="secondary">{t('language.hint')}</AppText>

      <AppText variant="heading">{t('about.reference')}</AppText>
      <View style={styles.card}>
        <AppText>{t('about.version', { version: content.version })}</AppText>
        <AppText variant="secondary">
          {t('about.counts', {
            classes: content.classes.length,
            species: content.species.length,
            backgrounds: content.backgrounds.length,
            spells: content.spells.length,
            items: content.equipment.length,
          })}
        </AppText>
        <AppText variant="secondary">{t('about.translated', { done, total, percent })}</AppText>
        <AppText variant="secondary">{t('about.skills')}</AppText>
        {content.skills.slice(0, 4).map((s) => (
          <LText key={s.id} text={s.name} variant="secondary" />
        ))}
        <AppText variant="secondary">{t('about.classes')}</AppText>
        {content.classes.slice(0, 3).map((c) => (
          <LText key={c.id} text={c.name} variant="secondary" />
        ))}
      </View>

      <AppText variant="heading">{t('about.attribution')}</AppText>
      <AppText>{t('about.srd')}</AppText>
      <AppText variant="secondary">{t('about.ownTranslation')}</AppText>
      <AppText variant="secondary">
        {t('about.extra', {
          backgrounds: content.backgrounds.filter((b) => b.extra).length,
          feats: content.feats.filter((f) => f.extra).length,
          subclasses: content.subclasses.filter((x) => x.extra).length,
          species: content.species.filter((x) => x.extra).length,
        })}
      </AppText>
      <AppText variant="secondary">{t('about.icons')}</AppText>
    </Screen>
  );
}

import { useSQLiteContext } from 'expo-sqlite';

import { useTranslation } from '@/shared/i18n';
import { AppText, Chip, ChipRow } from '@/shared/ui';

import { saveJournalSettings, useJournalSettings } from '../../api/settings';
import { JOURNAL_GROUPS } from '../../config/constants';
import { toggleGroup } from '../../model/settings';

/** «О приложении → Хроника»: какие события приложение само записывает в летопись кампании. */
export function ChronicleSettingsSection() {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const settings = useJournalSettings();

  return (
    <>
      <AppText variant="heading">{t('chronicleSettings.title')}</AppText>
      <AppText variant="secondary">{t('chronicleSettings.hint')}</AppText>
      <ChipRow>
        {JOURNAL_GROUPS.map((group) => (
          <Chip
            key={group}
            label={t(`chronicleSettings.group.${group}`)}
            selected={!settings.disabled.includes(group)}
            onPress={() => saveJournalSettings(db, toggleGroup(settings, group)).catch(() => undefined)}
          />
        ))}
      </ChipRow>
    </>
  );
}

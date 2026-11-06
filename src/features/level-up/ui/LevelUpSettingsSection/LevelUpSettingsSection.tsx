import { useSQLiteContext } from 'expo-sqlite';

import { useTranslation } from '@/shared/i18n';
import { AppText, Segmented } from '@/shared/ui';

import { setLevelUpSettings, useLevelUpSettings } from '../../model/levelUpSettings';

/** Настройки повышения уровня в «О приложении»: переброс хитов и анимации колоды. */
export function LevelUpSettingsSection() {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const settings = useLevelUpSettings();
  const save = (patch: Parameters<typeof setLevelUpSettings>[1]) =>
    setLevelUpSettings(db, patch).catch(() => undefined);
  const onOff = [
    { value: 'on' as const, label: t('diceSettings.on') },
    { value: 'off' as const, label: t('diceSettings.off') },
  ];

  return (
    <>
      <AppText variant="heading">{t('levelUpSettings.title')}</AppText>
      <AppText>{t('levelUpSettings.allowHpReroll')}</AppText>
      <Segmented<'on' | 'off'>
        value={settings.allowHpReroll ? 'on' : 'off'}
        onChange={(value) => save({ allowHpReroll: value === 'on' })}
        options={onOff}
      />
      <AppText variant="secondary">{t('levelUpSettings.allowHpRerollHint')}</AppText>
      <AppText>{t('levelUpSettings.animations')}</AppText>
      <Segmented<'on' | 'off'>
        value={settings.animations ? 'on' : 'off'}
        onChange={(value) => save({ animations: value === 'on' })}
        options={onOff}
      />
      <AppText variant="secondary">{t('levelUpSettings.animationsHint')}</AppText>
    </>
  );
}

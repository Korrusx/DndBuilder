import { useSQLiteContext } from 'expo-sqlite';

import { useTranslation } from '@/shared/i18n';
import { AppText, Segmented } from '@/shared/ui';

import { setDiceSettings, useDiceSettings } from '../../model/diceSettings';
import type { DiceSkin, DiceStyle, DiceTableKind } from '../../model/types';

/** Настройки бросков: 3D-стол или простой бросок, анимация, вид кубиков и стола. */
export function DiceSettingsSection() {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const s = useDiceSettings();
  const save = (patch: Parameters<typeof setDiceSettings>[1]) => setDiceSettings(db, patch).catch(() => undefined);

  return (
    <>
      <AppText variant="heading">{t('diceSettings.title')}</AppText>
      <AppText>{t('diceSettings.style')}</AppText>
      <Segmented<DiceStyle>
        value={s.style}
        onChange={(style) => save({ style })}
        options={[
          { value: '3d', label: t('diceSettings.style3d') },
          { value: 'simple', label: t('diceSettings.styleSimple') },
        ]}
      />
      <AppText variant="secondary">{t('diceSettings.styleHint')}</AppText>
      {s.style === '3d' ? (
        <>
          <AppText>{t('diceSettings.animation')}</AppText>
          <Segmented<'on' | 'off'>
            value={s.animation ? 'on' : 'off'}
            onChange={(v) => save({ animation: v === 'on' })}
            options={[
              { value: 'on', label: t('diceSettings.on') },
              { value: 'off', label: t('diceSettings.off') },
            ]}
          />
          <AppText variant="secondary">{t('diceSettings.animationHint')}</AppText>
          <AppText>{t('diceSettings.skin')}</AppText>
          <Segmented<DiceSkin>
            value={s.skin}
            onChange={(skin) => save({ skin })}
            options={[
              { value: 'amber', label: t('diceSettings.amber') },
              { value: 'obsidian', label: t('diceSettings.obsidian') },
              { value: 'bone', label: t('diceSettings.bone') },
            ]}
          />
          <AppText>{t('diceSettings.table')}</AppText>
          <Segmented<DiceTableKind>
            value={s.table}
            onChange={(table) => save({ table })}
            options={[
              { value: 'felt', label: t('diceSettings.felt') },
              { value: 'stone', label: t('diceSettings.stone') },
            ]}
          />
        </>
      ) : null}
    </>
  );
}

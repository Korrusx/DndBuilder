import { useSQLiteContext } from 'expo-sqlite';

import { useTranslation } from '@/shared/i18n';
import { AppText, Segmented } from '@/shared/ui';

import { setDiceSettings, useDiceSettings } from '../../model/diceSettings';
import type { DiceSkin, DiceStyle, DiceTableKind } from '../../model/types';

/** Настройки бросков: 3D-стол или простой бросок, анимация, вид кубиков и стола, звук. */
export function DiceSettingsSection() {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const s = useDiceSettings();
  const save = (patch: Parameters<typeof setDiceSettings>[1]) => setDiceSettings(db, patch).catch(() => undefined);

  const styleOptions = [
    { value: '3d' as DiceStyle, label: t('diceSettings.style3d') },
    { value: 'simple' as DiceStyle, label: t('diceSettings.styleSimple') },
  ];
  const onOffOptions = [
    { value: 'on' as const, label: t('diceSettings.on') },
    { value: 'off' as const, label: t('diceSettings.off') },
  ];
  const skinOptions = [
    { value: 'amber' as DiceSkin, label: t('diceSettings.amber') },
    { value: 'obsidian' as DiceSkin, label: t('diceSettings.obsidian') },
    { value: 'bone' as DiceSkin, label: t('diceSettings.bone') },
  ];
  const tableOptions = [
    { value: 'felt' as DiceTableKind, label: t('diceSettings.felt') },
    { value: 'stone' as DiceTableKind, label: t('diceSettings.stone') },
  ];

  return (
    <>
      <AppText variant="heading">{t('diceSettings.title')}</AppText>
      <AppText>{t('diceSettings.style')}</AppText>
      <Segmented<DiceStyle> value={s.style} onChange={(style) => save({ style })} options={styleOptions} />
      <AppText variant="secondary">{t('diceSettings.styleHint')}</AppText>
      <AppText>{t('diceSettings.sound')}</AppText>
      <Segmented<'on' | 'off'>
        value={s.sound ? 'on' : 'off'}
        onChange={(v) => save({ sound: v === 'on' })}
        options={onOffOptions}
      />
      <AppText variant="secondary">{t('diceSettings.soundHint')}</AppText>
      {s.style === '3d' ? (
        <>
          <AppText>{t('diceSettings.animation')}</AppText>
          <Segmented<'on' | 'off'>
            value={s.animation ? 'on' : 'off'}
            onChange={(v) => save({ animation: v === 'on' })}
            options={onOffOptions}
          />
          <AppText variant="secondary">{t('diceSettings.animationHint')}</AppText>
          <AppText>{t('diceSettings.skin')}</AppText>
          <Segmented<DiceSkin> value={s.skin} onChange={(skin) => save({ skin })} options={skinOptions} />
          <AppText>{t('diceSettings.table')}</AppText>
          <Segmented<DiceTableKind> value={s.table} onChange={(table) => save({ table })} options={tableOptions} />
        </>
      ) : null}
    </>
  );
}

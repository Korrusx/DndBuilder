import { useState } from 'react';
import { Alert } from 'react-native';

import { adjustResource, castSpell, divineSmiteDice } from '@/entities/character';
import { spellName } from '@/shared/content';
import { useTranslation } from '@/shared/i18n';
import { formatDice } from '@/shared/lib/dice';
import { AppText, Card, Chip, ChipRow, Segmented, SmallButton } from '@/shared/ui';

import { FREE_SMITE_KEY } from '../../config/constants';
import { damageTypeName } from '../../lib/damageType';
import type { SmiteCardProps } from './SmiteCard.types';

export function SmiteCard({
  slots,
  hasFreeSmiteFeature,
  freeSmiteLeft,
  characterState,
  onDamage,
  onUpdateState,
}: SmiteCardProps) {
  const { t } = useTranslation();
  const [smiteLevel, setSmiteLevel] = useState('1');
  const [smiteFiend, setSmiteFiend] = useState(false);

  const smiteSlot = smiteLevel === 'free' ? 1 : Number(smiteLevel);
  const smiteLevels = slots.map((n, i) => (n > 0 ? i + 1 : 0)).filter(Boolean);
  const smiteOptions = [
    ...smiteLevels.map((n) => ({ value: String(n), label: t('spell.circle', { level: n }) })),
    ...(hasFreeSmiteFeature ? [{ value: 'free', label: t('combat.smiteFree') }] : []),
  ];

  const castSmite = () => {
    const dice = divineSmiteDice(smiteSlot, smiteFiend);
    if (smiteLevel === 'free') {
      if (!freeSmiteLeft) {
        Alert.alert(t('combat.smiteFree'), t('combat.smiteFreeUsed'));
        return;
      }
      onUpdateState((s) => adjustResource(s, FREE_SMITE_KEY, 1, 1));
    } else {
      const result = castSpell(characterState, 1, slots, smiteSlot);
      if (!result) {
        Alert.alert(t('magic.noSlots'), t('combat.smiteNoSlot', { level: smiteSlot }));
        return;
      }
      onUpdateState(() => result.state);
    }
    onDamage({ title: spellName('divine-smite'), dice, bonus: 0, damageType: damageTypeName('radiant') });
  };

  return (
    <Card style={{ gap: 8 }}>
      <AppText variant="heading">{spellName('divine-smite')}</AppText>
      <AppText variant="secondary">{t('combat.smiteHint')}</AppText>
      <Segmented<string> value={smiteLevel} onChange={setSmiteLevel} options={smiteOptions} />
      {smiteLevel === 'free' ? (
        <AppText variant="secondary">{t('combat.smiteFreeHint', { left: freeSmiteLeft })}</AppText>
      ) : null}
      <ChipRow>
        <Chip label={t('combat.smiteFiend')} selected={smiteFiend} onPress={() => setSmiteFiend((v) => !v)} />
      </ChipRow>
      <SmallButton
        title={t('combat.smiteCast', { dice: formatDice(divineSmiteDice(smiteSlot, smiteFiend)) })}
        tone="damage"
        onPress={castSmite}
      />
    </Card>
  );
}

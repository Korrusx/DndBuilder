import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { TextInput } from 'react-native';

import { amountText } from '@/entities/campaign';
import { walletValue } from '@/entities/character';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { useResetState } from '@/shared/lib/reset-state';
import { AppText, BottomSheet, Button, Chip, ChipRow } from '@/shared/ui';

import { payFromWallet } from '../../api/pay';
import { walletCoin } from '../../model/walletCoin';
import { styles } from './PayFromWalletSheet.styles';
import type { PayFromWalletSheetProps } from './PayFromWalletSheet.types';

/** Сколько внести из кошелька в счётчик квеста; больше, чем есть, — мягкое сообщение, ничего не меняется. */
export function PayFromWalletSheet({ quest, counter, heroes, onClose, onPaid }: PayFromWalletSheetProps) {
  const db = useSQLiteContext();
  const { t } = useTranslation();
  const [heroId, setHeroId] = useResetState(heroes[0]?.id ?? '', quest);
  const hero = heroes.find((character) => character.id === heroId) ?? heroes[0];
  const unit = walletCoin(counter?.unit ?? 'gp');
  const inWallet = hero ? walletValue(hero.coins, unit) : 0;
  const left = counter ? Math.max(0, counter.target - counter.current) : 0;
  const [amount, setAmount] = useResetState(String(Math.min(left, inWallet) || ''), quest);
  const [message, setMessage] = useState('');
  const value = Math.floor(Number(amount) || 0);

  const pay = async () => {
    if (!quest || !counter || !hero || value <= 0) {
      return;
    }
    const result = await payFromWallet(db, {
      campaignId: quest.campaignId,
      questId: quest.id,
      questName: quest.name,
      counter,
      characterId: hero.id,
      amount: value,
    });
    if (result.ok) {
      setMessage('');
      onPaid();
    } else {
      setMessage(
        result.reason === 'notEnough'
          ? t('chronicle.pay.notEnough', { amount: amountText(result.available, result.unit) })
          : t('chronicle.pay.noHero'),
      );
    }
  };

  return (
    <BottomSheet
      visible={!!quest}
      title={quest ? t('chronicle.pay.title', { name: quest.name }) : undefined}
      onClose={() => {
        setMessage('');
        onClose();
      }}
    >
      {heroes.length > 1 ? (
        <ChipRow>
          {heroes.map((character) => (
            <Chip
              key={character.id}
              label={character.name}
              selected={character.id === hero?.id}
              onPress={() => setHeroId(character.id)}
            />
          ))}
        </ChipRow>
      ) : null}
      {hero ? (
        <AppText variant="secondary">
          {t('chronicle.pay.wallet', { name: hero.name, amount: amountText(inWallet, unit) })}
          {left ? ` · ${t('chronicle.pay.left', { amount: amountText(left, unit) })}` : ''}
        </AppText>
      ) : (
        <AppText style={styles.soft}>{t('chronicle.pay.noHero')}</AppText>
      )}
      <TextInput
        value={amount}
        onChangeText={(text) => {
          setAmount(text.replace(/[^0-9]/g, ''));
          setMessage('');
        }}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      {message ? <AppText style={styles.soft}>{message}</AppText> : null}
      <Button
        title={t('chronicle.pay.button', { amount: amountText(value, unit) })}
        disabled={!hero || value <= 0}
        onPress={() => pay().catch((error) => setMessage(error instanceof Error ? error.message : String(error)))}
      />
    </BottomSheet>
  );
}

import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { HpMethod } from '@/entities/character';
import { averageHitDie } from '@/entities/character';
import { HpSummary, useShake } from '@/features/level-up';
import { DiceTable, Die, useDiceSettings } from '@/features/roll-dice';
import { t } from '@/shared/i18n';
import { formatDie, rollDie } from '@/shared/lib/dice';

import { styles } from './HpStep.styles';
import type { HpStepProps } from './HpStep.types';

/**
 * У2 · Хиты: кость класса на 3D-столе (встряхивание бросает её), «Бросить / Среднее / Свой кубик», разбор
 * и полоса «было → стало». Брошенное закреплено, пока не включена настройка переброса.
 */
export function HpStep({ card, die, className, hp, defaultMethod, allowReroll, onChange }: HpStepProps) {
  const dice = useDiceSettings();
  const [method, setMethod] = useState<HpMethod>(hp?.method ?? defaultMethod);
  const [rollId, setRollId] = useState(0);
  const [landed, setLanded] = useState(true);
  const [table3d, setTable3d] = useState(dice.style === '3d');
  const [manual, setManual] = useState(hp?.method === 'manual' ? String(hp.value) : '');
  const locked = hp?.method === 'roll' && !allowReroll;
  const average = averageHitDie(die);

  const roll = () => {
    if (locked) {
      return;
    }
    const value = rollDie(die);
    setMethod('roll');
    setLanded(!table3d);
    setRollId((id) => id + 1);
    onChange({ method: 'roll', value });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  };
  useShake(method === 'roll' && !locked, roll);

  // По умолчанию «среднее» — его можно сразу закрепить, бросать ничего не нужно.
  useEffect(() => {
    if (!hp && defaultMethod === 'average') {
      onChange({ method: 'average', value: average });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (next: HpMethod) => {
    if (locked && next !== 'roll') {
      return;
    }
    setMethod(next);
    if (next === 'average') {
      onChange({ method: 'average', value: average });
    }
    if (next === 'roll' && hp?.method !== 'roll') {
      roll();
    }
  };
  const saveManual = (text: string) => {
    setManual(text);
    const value = Number(text);
    if (Number.isInteger(value) && value >= 1 && value <= die) {
      onChange({ method: 'manual', value });
    }
  };

  const rolled = hp?.method === 'roll' ? hp.value : undefined;
  const methods: { id: HpMethod; title: string; sub: string }[] = [
    {
      id: 'roll',
      title: t('levelUpDeck.hp.roll'),
      sub: rolled ? t('levelUpDeck.hp.rollSub', { value: rolled }) : t('levelUpDeck.hp.rollSubEmpty'),
    },
    { id: 'average', title: t('levelUpDeck.hp.average'), sub: t('levelUpDeck.hp.averageSub', { value: average }) },
    { id: 'manual', title: t('levelUpDeck.hp.manual'), sub: t('levelUpDeck.hp.manualSub') },
  ];
  const showSummary = !!hp && (hp.method !== 'roll' || landed);

  return (
    <>
      <View style={styles.head}>
        <Text style={styles.title}>{t('levelUpDeck.hp.title')}</Text>
        <Text style={styles.sub}>{t('levelUpDeck.hp.die', { className, die: formatDie(die) })}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('levelUpDeck.hp.roll')}
        onPress={roll}
        style={styles.table}
      >
        {table3d ? (
          <DiceTable
            roll={rolled && rollId ? { id: rollId, dice: [rolled], sides: die } : null}
            settings={dice}
            onLanded={() => setLanded(true)}
            onError={() => {
              setTable3d(false);
              setLanded(true);
            }}
          />
        ) : (
          <View style={styles.simple}>
            <Die value={rolled ?? (hp?.value || die)} dropped={!rolled && hp?.method !== 'manual'} />
          </View>
        )}
        <Text style={styles.shake}>{table3d ? t('levelUpDeck.hp.shake3d') : t('levelUpDeck.hp.shake')}</Text>
      </Pressable>

      <View style={styles.methods} accessibilityRole="radiogroup">
        {methods.map((item) => {
          const on = method === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on, disabled: locked && item.id !== 'roll' }}
              disabled={locked && item.id !== 'roll'}
              onPress={() => (item.id === 'roll' && on ? roll() : pick(item.id))}
              style={[styles.method, on && styles.methodOn]}
            >
              <Text style={[styles.methodTitle, on && styles.methodTitleOn]}>{item.title}</Text>
              <Text style={[styles.methodSub, on && styles.methodSubOn]}>{item.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      {method === 'manual' ? (
        <View style={styles.manual}>
          <TextInput
            value={manual}
            onChangeText={saveManual}
            keyboardType="number-pad"
            maxLength={2}
            placeholder={t('levelUpDeck.hp.manualPrompt', { die: formatDie(die), max: die })}
            placeholderTextColor="#6B737D"
            style={styles.input}
          />
        </View>
      ) : null}
      {locked ? <Text style={styles.note}>{t('levelUpDeck.hp.locked')}</Text> : null}

      {showSummary && card.hp ? <HpSummary hp={card.hp} /> : null}
    </>
  );
}

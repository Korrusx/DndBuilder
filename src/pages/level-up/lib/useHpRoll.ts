// Хиты уровня в карте колоды: бросок (на 3D-столе поверх экрана), среднее, свой кубик и закрепление
// броска — логика бывшего экрана хитов (У2). Сам расчёт хитов — hpGain в колоде.

import * as Haptics from 'expo-haptics';
import { useState } from 'react';

import type { HpChoice } from '@/entities/character';
import { averageHitDie } from '@/entities/character';
import { useDiceSettings } from '@/features/roll-dice';
import { rollDie } from '@/shared/lib/dice';

type TableState = { id: number; value: number } | null;

export function useHpRoll(
  die: number,
  hp: HpChoice | undefined,
  allowReroll: boolean,
  onChange: (hp: HpChoice) => void,
) {
  const dice = useDiceSettings();
  const [table, setTable] = useState<TableState>(null);
  const [table3d, setTable3d] = useState(dice.style === '3d');
  const [manualOpen, setManualOpen] = useState(false);
  // Брошенное закреплено, пока не включена настройка «Разрешить переброс хитов».
  const locked = hp?.method === 'roll' && !allowReroll;

  const roll = () => {
    if (locked || table) {
      return;
    }
    const value = rollDie(die);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
    if (table3d) {
      // Результат уходит в карту, когда кость легла на столе.
      setTable({ id: Date.now(), value });
    } else {
      onChange({ method: 'roll', value });
    }
  };
  const landed = () => {
    if (table) {
      onChange({ method: 'roll', value: table.value });
      setTable(null);
    }
  };
  const tableFailed = () => {
    setTable3d(false);
    landed();
  };
  const average = () => {
    if (!locked) {
      onChange({ method: 'average', value: averageHitDie(die) });
    }
  };
  const manual = (value: number) => {
    setManualOpen(false);
    if (!locked && Number.isInteger(value) && value >= 1 && value <= die) {
      onChange({ method: 'manual', value });
    }
  };

  return {
    locked,
    roll,
    average,
    manual,
    manualOpen,
    openManual: () => setManualOpen(!locked),
    closeManual: () => setManualOpen(false),
    table: table ? { id: table.id, dice: [table.value], sides: die } : null,
    diceSettings: dice,
    landed,
    tableFailed,
  };
}

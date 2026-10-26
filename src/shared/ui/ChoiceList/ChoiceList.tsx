import { useState } from 'react';
import { View } from 'react-native';

import { useTranslation } from '@/shared/i18n';

import { ChoiceRow } from '../ChoiceRow/ChoiceRow';
import { DetailSheet } from '../DetailSheet/DetailSheet';
import { togglePick } from '../PickerScreen/pickerLogic';
import { styles } from './ChoiceList.styles';
import type { ChoiceListProps } from './ChoiceList.types';

/** Строки выбора прямо на экране (без отдельного экрана): нажатие — описание в шторке, кружок — выбор. */
export function ChoiceList({ items, selected, max, onChange, detail, onAdd }: ChoiceListProps) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);
  const full = max > 1 && selected.length >= max;
  const reasons = new Map(items.map((item) => [item.id, item.reason]));
  const toggle = (id: string) => (onAdd ? onAdd(id) : onChange(togglePick(selected, id, max)));
  return (
    <View style={styles.list}>
      {items.map((item) => {
        const isOn = !onAdd && selected.includes(item.id);
        return (
          <ChoiceRow
            key={item.id}
            title={item.title}
            summary={item.summary}
            tags={item.tags}
            icon={item.icon}
            mark={onAdd ? 'add' : 'check'}
            selected={isOn}
            disabled={!onAdd && !isOn && (full || !!item.reason)}
            reason={item.reason}
            onOpen={() => setOpenId(item.id)}
            onToggle={() => toggle(item.id)}
          />
        );
      })}
      <DetailSheet
        ids={items.map((item) => item.id)}
        id={openId}
        detail={detail}
        onNavigate={setOpenId}
        onClose={() => setOpenId(null)}
        choice={{
          isSelected: (id) => !onAdd && selected.includes(id),
          reason: (id) => reasons.get(id),
          picked: selected.length,
          max,
          onToggle: toggle,
          actionLabel: onAdd ? t('detailSheet.add') : undefined,
        }}
      />
    </View>
  );
}

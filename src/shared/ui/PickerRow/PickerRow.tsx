import { memo } from 'react';

import { ChoiceRow } from '../ChoiceRow/ChoiceRow';
import type { PickerRowProps } from './PickerRow.types';

/** Строка полноэкранного выбора: перерисовывается, только если поменялись её данные или отметка. */
export const PickerRow = memo(function PickerRow({ item, selected, disabled, onOpen, onToggle }: PickerRowProps) {
  return (
    <ChoiceRow
      title={item.title}
      summary={item.summary}
      tags={item.tags}
      icon={item.icon}
      selected={selected}
      disabled={disabled}
      reason={item.reason}
      onOpen={() => onOpen(item.id)}
      onToggle={() => onToggle(item.id)}
    />
  );
});

import { Chip } from '../Chip/Chip';
import { ChipRow } from '../ChipRow/ChipRow';
import type { MultiPickProps } from './MultiPick.types';

/**
 * Выбор нескольких вариантов из списка с ограничением.
 * `blocked` — варианты, которые уже даны или выбраны в другом месте.
 */
export function MultiPick({
  options,
  selected,
  max,
  label,
  blocked,
  onChange,
}: MultiPickProps) {
  const full = selected.length >= max;
  return (
    <ChipRow>
      {options.map((id) => {
        const isOn = selected.includes(id);
        const blockedNote = blocked?.get(id);
        return (
          <Chip
            key={id}
            label={label(id)}
            selected={isOn}
            note={blockedNote}
            disabled={!isOn && (full || !!blockedNote)}
            onPress={() => onChange(isOn ? selected.filter((x) => x !== id) : max === 1 ? [id] : [...selected, id])}
          />
        );
      })}
    </ChipRow>
  );
}

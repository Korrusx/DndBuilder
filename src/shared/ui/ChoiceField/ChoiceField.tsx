import { PickerField } from '../PickerField/PickerField';
import type { ChoiceFieldProps } from './ChoiceField.types';

/** Раздел выбора из готовых вариантов с описаниями (черты, воззвания, языки, виды…). */
export function ChoiceField({ entries, ...field }: ChoiceFieldProps) {
  const details = new Map(entries.map((entry) => [entry.id, entry.detail]));
  return <PickerField {...field} items={entries} detail={(id) => details.get(id) ?? null} />;
}

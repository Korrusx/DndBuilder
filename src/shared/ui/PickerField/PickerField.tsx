import { useState } from 'react';

import { useTranslation } from '@/shared/i18n';

import { AppText } from '../AppText/AppText';
import { Button } from '../Button/Button';
import { ChoiceList } from '../ChoiceList/ChoiceList';
import { PickerScreen } from '../PickerScreen/PickerScreen';
import { Section } from '../Section/Section';
import type { PickerFieldProps } from './PickerField.types';

/** Столько вариантов и меньше показываем строками прямо в разделе, больше — на отдельном экране. */
const INLINE_LIMIT = 4;

/**
 * Раздел шага. До четырёх вариантов — строки прямо в разделе; больше — что уже выбрано
 * и кнопка, открывающая полноэкранный выбор с поиском.
 */
export function PickerField({ title, hint, need, buttonLabel, open, onOpen, onClose, ...picker }: PickerFieldProps) {
  const { t } = useTranslation();
  const [ownOpen, setOwnOpen] = useState(false);
  const visible = open ?? ownOpen;
  const titles = new Map(picker.items.map((item) => [item.id, item.title]));
  const names = picker.selected.map((id) => titles.get(id) ?? id);
  if (picker.items.length <= INLINE_LIMIT) {
    return (
      <Section title={title} hint={hint} picked={picker.selected.length} need={need ?? picker.max}>
        <ChoiceList
          items={picker.items}
          selected={picker.selected}
          max={picker.max}
          onChange={picker.onChange}
          detail={picker.detail}
        />
      </Section>
    );
  }
  return (
    <Section title={title} hint={hint} picked={picker.selected.length} need={need ?? picker.max}>
      <AppText variant="secondary">{names.length ? names.join(', ') : t('picker.nothing')}</AppText>
      <Button
        title={`${buttonLabel ?? t('picker.choose')} ›`}
        variant="secondary"
        onPress={() => (onOpen ? onOpen() : setOwnOpen(true))}
      />
      <PickerScreen
        {...picker}
        title={title}
        visible={visible}
        onClose={() => (onClose ? onClose() : setOwnOpen(false))}
      />
    </Section>
  );
}

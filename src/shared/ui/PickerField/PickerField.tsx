import { useState } from 'react';

import { useTranslation } from '@/shared/i18n';

import { AppText } from '../AppText/AppText';
import { Button } from '../Button/Button';
import { PickerScreen } from '../PickerScreen/PickerScreen';
import { Section } from '../Section/Section';
import type { PickerFieldProps } from './PickerField.types';

/** Раздел шага: что уже выбрано и кнопка, открывающая полноэкранный выбор. */
export function PickerField({ title, hint, need, buttonLabel, open, onOpen, onClose, ...picker }: PickerFieldProps) {
  const { t } = useTranslation();
  const [ownOpen, setOwnOpen] = useState(false);
  const visible = open ?? ownOpen;
  const titles = new Map(picker.items.map((item) => [item.id, item.title]));
  const names = picker.selected.map((id) => titles.get(id) ?? id);
  return (
    <Section title={title} hint={hint} picked={picker.selected.length} need={need ?? picker.max}>
      <AppText variant="secondary">{names.length ? names.join(', ') : t('picker.nothing')}</AppText>
      <Button title={`${buttonLabel} ›`} variant="secondary" onPress={() => (onOpen ? onOpen() : setOwnOpen(true))} />
      <PickerScreen
        {...picker}
        title={title}
        visible={visible}
        onClose={() => (onClose ? onClose() : setOwnOpen(false))}
      />
    </Section>
  );
}

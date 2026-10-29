import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInput } from 'react-native';

import type { Entity } from '@/entities/campaign';
import { searchEntities } from '@/entities/campaign';
import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { useResetState } from '@/shared/lib/reset-state';
import { AppText, BottomSheet, Button, SmallButton } from '@/shared/ui';

import { ENTITY_ICONS } from '../../config/constants';
import { inputStyles } from '../../lib/inputStyle';
import { styles } from './EntityPickerSheet.styles';
import type { EntityPickerSheetProps } from './EntityPickerSheet.types';

/** Выбор карточки из кампании (с поиском); для связи — ещё и подпись «как связаны». */
export function EntityPickerSheet({
  visible,
  title,
  entities,
  onClose,
  onPick,
  labelPlaceholder,
  onPickWithLabel,
  onClear,
}: EntityPickerSheetProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useResetState('', visible);
  const [label, setLabel] = useResetState('', visible);
  const [picked, setPicked] = useState<Entity | null>(null);
  const withLabel = !!onPickWithLabel;

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={() => {
        setPicked(null);
        onClose();
      }}
    >
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('chronicle.searchPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={inputStyles.input}
      />
      {searchEntities(query, entities)
        .slice(0, 12)
        .map((entity) => (
          <Pressable
            key={entity.id}
            accessibilityRole="button"
            onPress={() => (withLabel ? setPicked(entity) : onPick(entity))}
            style={[styles.row, picked?.id === entity.id && styles.picked]}
          >
            <MaterialCommunityIcons name={ENTITY_ICONS[entity.type]} size={20} color={colors.textSecondary} />
            <AppText style={styles.name} numberOfLines={1}>
              {entity.name}
            </AppText>
            {entity.role ? <AppText variant="secondary">{entity.role}</AppText> : null}
          </Pressable>
        ))}
      {entities.length === 0 ? <AppText variant="secondary">{t('chronicle.card.nothingToPick')}</AppText> : null}
      {withLabel ? (
        <>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder={labelPlaceholder}
            placeholderTextColor={colors.textSecondary}
            style={inputStyles.input}
          />
          <Button
            title={t('chronicle.card.addLink')}
            disabled={!picked}
            onPress={() => {
              if (picked) {
                onPickWithLabel(picked, label.trim());
                setPicked(null);
              }
            }}
          />
        </>
      ) : null}
      {onClear ? <SmallButton title={t('chronicle.card.clear')} onPress={onClear} /> : null}
    </BottomSheet>
  );
}

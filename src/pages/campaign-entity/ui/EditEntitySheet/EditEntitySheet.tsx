import { TextInput } from 'react-native';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { useResetState } from '@/shared/lib/reset-state';
import { AppText, BottomSheet, Button } from '@/shared/ui';

import { inputStyles } from '../../lib/inputStyle';
import type { EditEntitySheetProps } from './EditEntitySheet.types';

/** Имя, короткая роль и описание карточки; удалить карточку. */
export function EditEntitySheet({ entity, visible, onClose, onSave, onDelete }: EditEntitySheetProps) {
  const { t } = useTranslation();
  const [name, setName] = useResetState(entity.name, visible);
  const [role, setRole] = useResetState(entity.role, visible);
  const [description, setDescription] = useResetState(entity.description, visible);
  return (
    <BottomSheet visible={visible} title={t(`chronicle.entityType.${entity.type}`)} onClose={onClose}>
      <AppText variant="secondary">{t('chronicle.edit.name')}</AppText>
      <TextInput value={name} onChangeText={setName} style={inputStyles.input} />
      <AppText variant="secondary">{t('chronicle.card.role')}</AppText>
      <TextInput
        value={role}
        onChangeText={setRole}
        placeholder={t(`chronicle.card.rolePlaceholder.${entity.type}`)}
        placeholderTextColor={colors.textSecondary}
        style={inputStyles.input}
      />
      <AppText variant="secondary">{t('chronicle.card.description')}</AppText>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={[inputStyles.input, inputStyles.multiline]}
      />
      <Button
        title={t('common.done')}
        disabled={!name.trim()}
        onPress={() => onSave({ name: name.trim(), role: role.trim(), description: description.trim() })}
      />
      <Button title={t('chronicle.card.delete')} variant="danger" onPress={onDelete} />
    </BottomSheet>
  );
}

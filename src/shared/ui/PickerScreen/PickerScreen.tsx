import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';

import { AppText } from '../AppText/AppText';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { ChoiceRow } from '../ChoiceRow/ChoiceRow';
import { DetailSheet } from '../DetailSheet/DetailSheet';
import { filterPickItems, togglePick } from './pickerLogic';
import { styles } from './PickerScreen.styles';
import type { PickerScreenProps } from './PickerScreen.types';

/**
 * Полноэкранный выбор из списка: поиск, фильтры-плашки, строки (нажатие — описание в шторке, кружок — выбор)
 * и закреплённая кнопка «Выбрано N из M · Далее».
 */
export function PickerScreen({
  visible,
  title,
  items,
  filters = [],
  selected,
  max,
  onChange,
  detail,
  onClose,
  onNext,
}: PickerScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const shown = useMemo(() => filterPickItems(items, query, active, filters), [items, query, active, filters]);
  const reasons = useMemo(() => new Map(items.map((item) => [item.id, item.reason])), [items]);
  const full = max > 1 && selected.length >= max;
  const toggle = (id: string) => onChange(togglePick(selected, id, max));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={onClose}
            style={styles.back}
          >
            <AppText style={styles.backLabel}>‹</AppText>
          </Pressable>
          <AppText variant="heading" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
        </View>
        <View style={styles.controls}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('picker.search')}
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
          {filters.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {filters.map((filter) => {
                const on = active.includes(filter.key);
                return (
                  <Chip
                    key={filter.key}
                    label={filter.label}
                    selected={on}
                    onPress={() => setActive(on ? active.filter((key) => key !== filter.key) : [...active, filter.key])}
                  />
                );
              })}
            </ScrollView>
          ) : null}
        </View>
        <FlatList
          data={shown}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <AppText variant="secondary" style={styles.empty}>
              {t('picker.empty')}
            </AppText>
          }
          renderItem={({ item }) => {
            const isOn = selected.includes(item.id);
            return (
              <ChoiceRow
                title={item.title}
                summary={item.summary}
                tags={item.tags}
                icon={item.icon}
                selected={isOn}
                disabled={!isOn && (full || !!item.reason)}
                reason={item.reason}
                onOpen={() => setOpenId(item.id)}
                onToggle={() => toggle(item.id)}
              />
            );
          }}
        />
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            title={t(onNext ? 'picker.next' : 'picker.done', { picked: selected.length, max })}
            onPress={onNext ?? onClose}
          />
        </View>
      </View>
      <DetailSheet
        ids={shown.map((item) => item.id)}
        id={openId}
        detail={detail}
        onNavigate={setOpenId}
        onClose={() => setOpenId(null)}
        choice={{
          isSelected: (id) => selected.includes(id),
          reason: (id) => reasons.get(id),
          picked: selected.length,
          max,
          onToggle: toggle,
        }}
      />
    </Modal>
  );
}

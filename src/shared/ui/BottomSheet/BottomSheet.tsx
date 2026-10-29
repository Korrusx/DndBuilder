import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { useKeyboardHeight } from '@/shared/lib/keyboard';

import { AppText } from '../AppText/AppText';
import { styles } from './BottomSheet.styles';
import type { BottomSheetProps } from './BottomSheet.types';

/** Нижняя панель поверх экрана. Нажатие на затемнение закрывает её. */
export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  // Modal на Android не поднимается над клавиатурой сам — поднимаем панель на её высоту.
  const keyboard = useKeyboardHeight();
  return (
    // Android: окно до краёв экрана — панель уходит под полосу навигации, отступ снизу внутри неё
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.wrap, { paddingBottom: keyboard }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.close')} />
        <View style={[styles.sheet, { paddingBottom: (keyboard ? 0 : insets.bottom) + spacing.lg }]}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={{ gap: spacing.md }} bounces={false} keyboardShouldPersistTaps="handled">
            {title ? <AppText variant="heading">{title}</AppText> : null}
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

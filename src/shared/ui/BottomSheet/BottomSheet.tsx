import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';

import { AppText } from '../AppText/AppText';
import { styles } from './BottomSheet.styles';
import type { BottomSheetProps } from './BottomSheet.types';

/** Нижняя панель поверх экрана. Нажатие на затемнение закрывает её. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
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
      <View style={styles.wrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.close')} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={{ gap: spacing.md }} bounces={false}>
            {title ? <AppText variant="heading">{title}</AppText> : null}
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

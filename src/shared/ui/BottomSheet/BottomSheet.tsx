import { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/shared/config';
import { AppText } from '../AppText/AppText';
import { styles } from './BottomSheet.styles';

/** Нижняя панель поверх экрана. Нажатие на затемнение закрывает её. */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Закрыть" />
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

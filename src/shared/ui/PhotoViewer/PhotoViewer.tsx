import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';

import { styles } from './PhotoViewer.styles';
import type { PhotoViewerProps } from './PhotoViewer.types';

/** Фото на весь экран; несколько — листаются вбок. Нажатие на фото или крестик закрывает. */
export function PhotoViewer({ uris, index, onClose }: PhotoViewerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Modal visible={index !== null} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.wrap}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: (index ?? 0) * width, y: 0 }}
        >
          {uris.map((uri) => (
            <Pressable key={uri.slice(-32)} onPress={onClose} style={{ width }}>
              <Image source={{ uri }} resizeMode="contain" style={[styles.photo, { width }]} />
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          style={[styles.close, { top: insets.top + 8 }]}
        >
          <MaterialCommunityIcons name="close" size={26} color={colors.text} />
        </Pressable>
      </View>
    </Modal>
  );
}

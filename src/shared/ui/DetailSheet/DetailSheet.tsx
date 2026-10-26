import { useEffect, useMemo, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';

import { AppText } from '../AppText/AppText';
import { Button } from '../Button/Button';
import { choiceButton } from './choiceButton';
import { styles } from './DetailSheet.styles';
import type { DetailSheetProps } from './DetailSheet.types';

/** Насколько протянуть, чтобы сработал свайп: вниз — закрыть, вбок — соседний вариант. */
const CLOSE_DISTANCE = 100;
const SWIPE_DISTANCE = 60;

/**
 * Нижняя шторка с описанием варианта. Закрывается свайпом вниз за верх шторки или нажатием на затемнение;
 * стрелки и свайп влево-вправо — к соседнему варианту списка. С `choice` внизу большая кнопка выбора.
 */
export function DetailSheet({ ids, id, detail, onNavigate, onClose, choice }: DetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [dragY] = useState(() => new Animated.Value(0));
  const index = id ? ids.indexOf(id) : -1;
  const prev = index > 0 ? ids[index - 1] : undefined;
  const next = index >= 0 && index < ids.length - 1 ? ids[index + 1] : undefined;
  const content = id ? detail(id) : null;

  useEffect(() => {
    if (id) {
      dragY.setValue(0);
    }
  }, [id, dragY]);

  const closePan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => dragY.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_, g) => {
          if (g.dy > CLOSE_DISTANCE || g.vy > 1) {
            onClose();
          } else {
            Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
          }
        },
        onPanResponderTerminate: () => Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start(),
      }),
    [dragY, onClose],
  );

  const sidePan = useMemo(
    () =>
      PanResponder.create({
        // Только явный горизонтальный жест: вертикальная прокрутка текста остаётся у ScrollView.
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -SWIPE_DISTANCE && next) {
            onNavigate(next);
          } else if (g.dx > SWIPE_DISTANCE && prev) {
            onNavigate(prev);
          }
        },
      }),
    [prev, next, onNavigate],
  );

  const button = id && choice ? choiceButton(id, choice) : null;

  return (
    <Modal
      visible={!!content}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.wrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.close')} />
        <Animated.View
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY: dragY }] }]}
        >
          <View style={styles.grab} {...closePan.panHandlers}>
            <View style={styles.handle} />
            {ids.length > 1 ? (
              <View style={styles.nav}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('detailSheet.previous')}
                  disabled={!prev}
                  onPress={() => prev && onNavigate(prev)}
                  style={[styles.arrow, !prev && styles.arrowDisabled]}
                >
                  <AppText style={styles.arrowLabel}>‹</AppText>
                </Pressable>
                <AppText style={styles.position}>
                  {t('detailSheet.position', { index: index + 1, count: ids.length })}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('detailSheet.next')}
                  disabled={!next}
                  onPress={() => next && onNavigate(next)}
                  style={[styles.arrow, !next && styles.arrowDisabled]}
                >
                  <AppText style={styles.arrowLabel}>›</AppText>
                </Pressable>
              </View>
            ) : null}
          </View>
          {content ? (
            <ScrollView contentContainerStyle={styles.body} bounces={false} {...sidePan.panHandlers}>
              <View>
                <AppText variant="heading">{content.title}</AppText>
                {content.subtitle ? <AppText variant="secondary">{content.subtitle}</AppText> : null}
              </View>
              {content.tags?.length ? (
                <View style={styles.tags}>
                  {content.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <AppText style={styles.tagLabel}>{tag}</AppText>
                    </View>
                  ))}
                </View>
              ) : null}
              {content.tiles?.length ? (
                <View style={styles.tiles}>
                  {content.tiles.map((tile) => (
                    <View key={tile.label} style={styles.tile}>
                      <AppText style={styles.tileLabel}>{tile.label}</AppText>
                      <AppText style={styles.tileValue}>{tile.value}</AppText>
                    </View>
                  ))}
                </View>
              ) : null}
              <AppText>{content.text || t('common.noDescription')}</AppText>
              {content.sections?.map((section) => (
                <View key={section.title}>
                  <AppText style={styles.sectionTitle}>{section.title}</AppText>
                  <AppText>{section.text}</AppText>
                </View>
              ))}
            </ScrollView>
          ) : null}
          {button ? (
            <View style={styles.footer}>
              {button.note ? (
                <AppText variant="secondary" style={styles.footerNote}>
                  {button.note}
                </AppText>
              ) : null}
              <Button
                title={button.title}
                variant={button.variant}
                disabled={button.disabled}
                style={styles.footerButton}
                onPress={() => id && choice?.onToggle(id)}
              />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

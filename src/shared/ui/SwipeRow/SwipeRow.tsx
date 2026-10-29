// Строка, которую можно смахнуть влево (удалить). Без сторонних библиотек: PanResponder + Animated.

import { useMemo, useState } from 'react';
import { Animated, PanResponder, View } from 'react-native';

import { AppText } from '../AppText/AppText';
import { SWIPE_THRESHOLD } from './constants';
import { styles } from './SwipeRow.styles';
import type { SwipeRowProps } from './SwipeRow.types';

export function SwipeRow({ children, onSwiped, label }: SwipeRowProps) {
  const [offset] = useState(() => new Animated.Value(0));
  const [width, setWidth] = useState(1);
  const [swiping, setSwiping] = useState(false);

  const pan = useMemo(() => {
    const back = () => Animated.spring(offset, { toValue: 0, useNativeDriver: true }).start(() => setSwiping(false));
    return PanResponder.create({
      // Только явный горизонтальный жест влево — вертикальная прокрутка списка не мешает.
      onMoveShouldSetPanResponder: (_, g) => g.dx < -12 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderGrant: () => setSwiping(true),
      onPanResponderMove: (_, g) => offset.setValue(Math.min(0, g.dx)),
      onPanResponderRelease: (_, g) => {
        if (-g.dx > width * SWIPE_THRESHOLD) {
          Animated.timing(offset, { toValue: -width, duration: 150, useNativeDriver: true }).start(() => {
            onSwiped();
            offset.setValue(0);
            setSwiping(false);
          });
        } else {
          back();
        }
      },
      onPanResponderTerminate: back,
    });
  }, [offset, width, onSwiped]);

  return (
    <View style={styles.wrap} onLayout={(layout) => setWidth(layout.nativeEvent.layout.width || 1)}>
      {swiping ? (
        <View style={styles.behind}>
          <AppText style={styles.label}>{label}</AppText>
        </View>
      ) : null}
      <Animated.View style={[styles.front, { transform: [{ translateX: offset }] }]} {...pan.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

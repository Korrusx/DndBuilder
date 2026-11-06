import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { DECK_MOTION } from '../../config/constants';
import { CardCollapsed } from './CardCollapsed';
import { CardExpanded } from './CardExpanded';
import { CardHidden } from './CardHidden';
import type { LevelUpCardViewProps } from './LevelUpCardView.types';

const RESIZE = LinearTransition.duration(DECK_MOTION.resize).easing(Easing.inOut(Easing.ease));

/**
 * Карта экрана «Новое на N-м уровне» (раздел 5.2): закрыта — рубашка, открыта — развёрнута или свёрнута
 * одной строкой. Открытие — переворот по горизонтальной оси: на 90° рубашка сменяется содержимым
 * (раздел 8). Без анимаций — сразу нужной стороной. Хиты и рост рисуются отдельно (HpRow, GrowthCard).
 */
export function LevelUpCardView({ expanded, ...props }: LevelUpCardViewProps) {
  const { card, animate } = props;
  const hidden = card.state === 'hidden';
  // Переворот идёт, пока рубашка не повернулась на 90°: до этого видна она, потом — содержимое.
  const [wasHidden, setWasHidden] = useState(hidden);
  const [flipping, setFlipping] = useState(false);
  if (wasHidden !== hidden) {
    setWasHidden(hidden);
    setFlipping(!hidden && animate);
  }
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!flipping) {
      return;
    }
    rotation.set(
      withSequence(
        withTiming(90, { duration: DECK_MOTION.flipHalf, easing: Easing.in(Easing.ease) }, (finished) => {
          if (finished) {
            scheduleOnRN(setFlipping, false);
          }
        }),
        withTiming(0, { duration: DECK_MOTION.flipHalf, easing: Easing.out(Easing.ease) }),
      ),
    );
  }, [flipping, rotation]);
  const showBack = hidden || flipping;

  const flip = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateX: `${rotation.get()}deg` }],
  }));

  return (
    <Animated.View layout={animate ? RESIZE : undefined} style={flip}>
      {showBack ? <CardHidden {...props} /> : expanded ? <CardExpanded {...props} /> : <CardCollapsed {...props} />}
    </Animated.View>
  );
}

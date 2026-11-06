import { Canvas, Circle, LinearGradient } from '@shopify/react-native-skia';
import { Pressable, Text, View } from 'react-native';

import { t } from '@/shared/i18n';

import { CARD_STYLES, DONE_SCREEN, HERO_CARD_THEMES } from '../../config/heroCardThemes';
import { SWATCH, styles } from './StyleSwitcher.styles';
import type { StyleSwitcherProps } from './StyleSwitcher.types';

const HIT_SLOP = { top: 4, bottom: 4, left: 0, right: 0 };

/** Кнопки стиля карты: Янтарь, Ночь, Пергамент — с кружком-образцом (раздел 4.1). */
export function StyleSwitcher({ value, onChange }: StyleSwitcherProps) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {CARD_STYLES.map((style) => {
        const on = style === value;
        const look = on ? DONE_SCREEN.styleOn : DONE_SCREEN.styleOff;
        return (
          <Pressable
            key={style}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            hitSlop={HIT_SLOP}
            onPress={() => onChange(style)}
            style={[
              styles.button,
              { borderWidth: on ? 1.5 : 1, borderColor: look.border, backgroundColor: look.background },
            ]}
          >
            <Canvas style={styles.swatch} pointerEvents="none">
              <Circle cx={SWATCH / 2} cy={SWATCH / 2} r={SWATCH / 2}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: SWATCH, y: SWATCH }}
                  colors={[...HERO_CARD_THEMES[style].swatch]}
                />
              </Circle>
            </Canvas>
            <Text style={[styles.label, { color: look.text }]}>{t(`heroCard.style.${style}`)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

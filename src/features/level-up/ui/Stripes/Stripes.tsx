import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import type { StripesProps } from './Stripes.types';

/** Косые полосы рубашки карты (в React Native нет повторяющегося градиента — рисуем узором SVG). */
export function Stripes({ colors: [first, second], width = 6 }: StripesProps) {
  const id = `stripes-${useId().replace(/:/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={width * 2}
          height={width * 2}
          patternTransform="rotate(45)"
        >
          <Rect width={width} height={width * 2} fill={first} />
          <Rect x={width} width={width} height={width * 2} fill={second} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

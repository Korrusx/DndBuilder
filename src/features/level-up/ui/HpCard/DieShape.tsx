import { Text, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

import { HP_CARD, styles } from './HpCard.styles';
import type { DieShapeProps } from './HpCard.types';

/**
 * Значок кости хитов: ромб к8 в зелёных тонах, четыре грани разной светлоты, внутри — число граней.
 * Для к6, к10 и к12 та же форма с другим числом.
 */
export function DieShape({ sides, size = 64 }: DieShapeProps) {
  const c = size / 2;
  const p = 2;
  return (
    <View style={[styles.die, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Polygon points={`${c},${p} ${p},${c} ${c},${c}`} fill={HP_CARD.light} />
        <Polygon points={`${c},${p} ${size - p},${c} ${c},${c}`} fill={HP_CARD.accent} />
        <Polygon points={`${p},${c} ${c},${size - p} ${c},${c}`} fill={HP_CARD.dim} />
        <Polygon points={`${size - p},${c} ${c},${size - p} ${c},${c}`} fill={HP_CARD.deep} />
        <Line x1={p} y1={c} x2={size - p} y2={c} stroke={HP_CARD.deep} strokeWidth={1} />
      </Svg>
      <Text style={styles.dieText}>{sides}</Text>
    </View>
  );
}

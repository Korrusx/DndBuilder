import type { CardStyle } from '../../config/heroCardThemes';

export type StyleSwitcherProps = {
  value: CardStyle;
  onChange: (style: CardStyle) => void;
};

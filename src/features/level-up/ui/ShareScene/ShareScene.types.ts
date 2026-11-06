import type { HostInstance } from 'react-native';

import type { CardStyle } from '../../config/heroCardThemes';
import type { ShareKind } from '../../config/shareScenes';
import type { HeroCardViewProps } from '../HeroCardView/HeroCardView.types';

export type ShareCardData = Omit<HeroCardViewProps, 'theme' | 'size' | 'width' | 'motion'>;

export type ShareSceneProps = {
  kind: ShareKind;
  style: CardStyle;
  card: ShareCardData;
  /** Заголовок сторис без рода: «Ирма Вейл · 6-й уровень». */
  storyTitle: string;
  /** «Тени Солёной Гавани · сессия 12» внизу сторис; без кампании — нет. */
  campaignLine?: string;
  /** Сцена разложена и отрисована — можно снимать. */
  onReady: (target: HostInstance) => void;
};

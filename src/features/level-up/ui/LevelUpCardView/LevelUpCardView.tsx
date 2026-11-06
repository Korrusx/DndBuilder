import { CardCollapsed } from './CardCollapsed';
import { CardExpanded } from './CardExpanded';
import { CardHidden } from './CardHidden';
import type { LevelUpCardViewProps } from './LevelUpCardView.types';

/**
 * Карта экрана «Новое на N-м уровне» (раздел 5.2): закрыта — рубашка, открыта — развёрнута или свёрнута
 * одной строкой. Хиты и рост рисуются отдельно (HpRow, GrowthCard).
 */
export function LevelUpCardView({ expanded, ...props }: LevelUpCardViewProps) {
  if (props.card.state === 'hidden') {
    return <CardHidden {...props} />;
  }
  return expanded ? <CardExpanded {...props} /> : <CardCollapsed {...props} />;
}

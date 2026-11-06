import { DONE_TIMELINE, SPARKS } from '../../lib/doneMotion';
import { CardSpark } from './CardSpark';
import type { CardSparksProps } from './CardSparks.types';

/** Три искры вокруг карты в 700, 950 и 1200 мс; при «уменьшении движения» их нет. */
export function CardSparks({ theme, animate }: CardSparksProps) {
  if (!animate) {
    return null;
  }
  return (
    <>
      {SPARKS.map((spark, i) => (
        <CardSpark
          key={i}
          delay={DONE_TIMELINE.sparks[i]}
          color={theme.spark[spark.color]}
          size={spark.size}
          diamond={spark.diamond}
          position={'left' in spark ? { left: spark.left, top: spark.top } : { right: spark.right, top: spark.top }}
        />
      ))}
    </>
  );
}

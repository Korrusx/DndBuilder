import { glowFlicker, haloPulse, INTRO, introTimeline, RING_END, RING_START, sparkPoint } from '../motion';

describe('анимация кольца ритуала', () => {
  test('уменьшение движения: сразу конечное состояние (кольцо полное, новая цифра, без свечения и вспышки)', () => {
    expect(RING_END).toMatchObject({
      progress: 1,
      oldOpacity: 0,
      newOpacity: 1,
      newScale: 1,
      burstOpacity: 0,
      glowOpacity: 0,
      sparkOpacity: 0,
      hintOpacity: 1,
    });
    expect(RING_START).toMatchObject({ progress: 0, glowOpacity: 0, glowScale: 0.9, hintOpacity: 0.3 });
  });

  test('таймлайн: заполнение 300–1500, удар на 1550, покой к 2200; вершина на 30 % дольше', () => {
    expect([INTRO.fillStart, INTRO.fillEnd, INTRO.impact, INTRO.settle]).toEqual([300, 1500, 1550, 2200]);
    const capstone = introTimeline(true);
    expect(capstone.fillEnd).toBeCloseTo(1950);
    expect(capstone.settle).toBeCloseTo(2860);
    // Ритуал: имя проявляется 1700–2200, нижний блок 1700–2100; без анимаций звук с 1450.
    expect([INTRO.hintStart, INTRO.actionsEnd, INTRO.reducedSound]).toEqual([1700, 2100, 1450]);
  });

  test('мерцание: растёт к концу заполнения, «дышит» с периодом 600 мс (≈2 пульса); в покое свечения нет', () => {
    expect(RING_END.glowOpacity).toBe(0);
    // В начале заполнения свечение проявляется из нуля за 150 мс, без скачка.
    expect(glowFlicker(0, 0)).toBeCloseTo(0);
    expect(glowFlicker(1, 1200)).toBeCloseTo(0.5);
    expect(glowFlicker(0.5, 150)).toBeCloseTo(0.15 + 0.175 + 0.12);
    expect(glowFlicker(0.5, 450)).toBeCloseTo(0.15 + 0.175 - 0.12);
    expect((INTRO.fillEnd - INTRO.fillStart) / INTRO.flickerPeriod).toBe(2);
    expect(haloPulse(150)).toBeCloseTo(0.85);
    expect(haloPulse(450)).toBeCloseTo(0.35);
  });

  test('искра на конце дуги: сверху, справа на четверти, снизу на половине', () => {
    const top = sparkPoint(0, 92, 80);
    expect(top.x).toBeCloseTo(92);
    expect(top.y).toBeCloseTo(12);
    expect(sparkPoint(0.25, 92, 80).x).toBeCloseTo(172);
    expect(sparkPoint(0.5, 92, 80).y).toBeCloseTo(172);
  });
});

// Синтезирует звуки бросков в assets/sounds/dice/*.wav: стук кости о сукно, камень, деревянный бортик и о другую кость
// (по 3 варианта), простой бросок, естественные 20 и 1. Звуки свои, без чужих записей и лицензий.
// Запуск: npm run dice:sounds, потом npm run dice:scene — стук вшивается в 3D-стол.
// Любой файл можно заменить записью (WAV, моно, 16 бит) с тем же именем. Сукно, бортик, кость о кость и простой бросок
// сейчас нарезаны из записи (npm run dice:slice) — после этого скрипта запусти и его.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets/sounds/dice');
const SR = 22050;

// Генератор с зерном: файлы при пересборке получаются те же
let seed = 20261015;
function rand(): number {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const jit = (x: number, spread = 0.08) => x * (1 + (rand() * 2 - 1) * spread);

/** Затухающий тон: частота (Гц), громкость, время спада в e раз (с). */
type Mode = { f: number; amp: number; decay: number };
/** Шум удара в полосе low–high Гц. */
type Noise = { amp: number; decay: number; low: number; high: number };

function peakTo(buf: Float32Array, peak: number): Float32Array {
  const max = buf.reduce((m, x) => Math.max(m, Math.abs(x)), 0) || 1;
  return buf.map((x) => (x / max) * peak);
}

function lowpass(buf: Float32Array, cutoff: number): Float32Array {
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
  let y = 0;
  return buf.map((x) => (y += a * (x - y)));
}

/** Удар: несколько затухающих тонов (резонансы предмета) и короткий шум в полосе (сам щелчок). */
function hit(modes: Mode[], noise: Noise, dur: number): Float32Array {
  const n = Math.round(dur * SR);
  const out = new Float32Array(n);
  for (const m of modes) {
    const ph = rand() * 2 * Math.PI;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      out[i] += m.amp * Math.exp(-t / m.decay) * Math.sin(2 * Math.PI * m.f * t + ph);
    }
  }
  const white = new Float32Array(n).map(() => rand() * 2 - 1);
  const hi = lowpass(white, noise.high);
  const lo = lowpass(white, noise.low);
  const band = peakTo(hi.map((x, i) => x - lo[i]), 1);
  for (let i = 0; i < n; i++) out[i] += noise.amp * Math.exp(-i / SR / noise.decay) * band[i];
  const attack = Math.round(0.0005 * SR);   // без щелчка от резкого начала
  for (let i = 0; i < attack; i++) out[i] *= i / attack;
  return peakTo(out, 0.8);
}

const HITS = {
  // глухой стук через сукно о дерево стола
  felt: () =>
    hit(
      [
        { f: jit(170), amp: 0.55, decay: 0.028 },
        { f: jit(410), amp: 0.3, decay: 0.018 },
        { f: jit(3300), amp: 0.1, decay: 0.007 },
      ],
      { amp: 1, decay: 0.012, low: 60, high: jit(1100) },
      0.12,
    ),
  // звонкий удар о камень
  stone: () =>
    hit(
      [
        { f: jit(950), amp: 0.3, decay: 0.014 },
        { f: jit(2500), amp: 0.5, decay: 0.022 },
        { f: jit(3900), amp: 0.35, decay: 0.016 },
        { f: jit(5400), amp: 0.22, decay: 0.011 },
      ],
      { amp: 0.7, decay: 0.005, low: 1500, high: 7000 },
      0.14,
    ),
  // деревянный бортик
  wood: () =>
    hit(
      [
        { f: jit(520), amp: 0.6, decay: 0.055 },
        { f: jit(1180), amp: 0.4, decay: 0.035 },
        { f: jit(2050), amp: 0.25, decay: 0.022 },
      ],
      { amp: 0.55, decay: 0.005, low: 300, high: 3000 },
      0.2,
    ),
  // кость о кость: короткий пластиковый щелчок
  die: () =>
    hit(
      [
        { f: jit(2900), amp: 0.5, decay: 0.013 },
        { f: jit(4700), amp: 0.4, decay: 0.009 },
        { f: jit(6800), amp: 0.3, decay: 0.006 },
      ],
      { amp: 0.7, decay: 0.0025, low: 2500, high: 9000 },
      0.07,
    ),
};

function mixAt(into: Float32Array, src: Float32Array, at: number, gain: number) {
  const start = Math.round(at * SR);
  for (let i = 0; i < src.length && start + i < into.length; i++) into[start + i] += src[i] * gain;
}

/** Простой бросок (без 3D-стола): кости падают, стучат друг о друга и затихают. */
function roll(): Float32Array {
  const out = new Float32Array(Math.round(0.75 * SR));
  const steps: [number, keyof typeof HITS, number][] = [
    [0, 'felt', 1], [0.06, 'die', 0.6], [0.13, 'felt', 0.75], [0.2, 'die', 0.45], [0.27, 'felt', 0.5],
    [0.36, 'felt', 0.35], [0.45, 'die', 0.25], [0.53, 'felt', 0.2], [0.62, 'felt', 0.1],
  ];
  for (const [at, kind, gain] of steps) mixAt(out, HITS[kind](), at, gain);
  return peakTo(out, 0.8);
}

/** Естественная 20: восходящий колокольчик до-ми-соль-до. */
function crit(): Float32Array {
  const out = new Float32Array(Math.round(1.4 * SR));
  [1046.5, 1318.5, 1568, 2093].forEach((f, k) => {
    const bell = hit(
      [
        { f, amp: 1, decay: 0.5 },
        { f: f * 2.76, amp: 0.25, decay: 0.2 },
        { f: f * 5.4, amp: 0.1, decay: 0.1 },
      ],
      { amp: 0.05, decay: 0.003, low: 3000, high: 9000 },
      1.2,
    );
    mixAt(out, bell, k * 0.07, 1);
  });
  return peakTo(out, 0.7);
}

/** Естественная 1: глухой стук и печальный тон, сползающий вниз. */
function fumble(): Float32Array {
  const n = Math.round(0.9 * SR);
  const tone = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 233 * Math.pow(147 / 233, Math.min(1, t / 0.6)) * (1 + 0.012 * Math.sin(2 * Math.PI * 5 * t));
    phase += (2 * Math.PI * f) / SR;
    const env = Math.min(1, t / 0.02) * Math.exp(-Math.max(0, t - 0.45) / 0.12);
    tone[i] = env * (Math.sin(phase) + 0.35 * Math.sin(2 * phase) + 0.15 * Math.sin(3 * phase));
  }
  const out = lowpass(tone, 1200);
  const shifted = new Float32Array(n);
  mixAt(shifted, out, 0.08, 1);
  mixAt(shifted, HITS.felt(), 0, 1.4);
  return peakTo(shifted, 0.6);
}

function wav(samples: Float32Array): Buffer {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);        // PCM
  h.writeUInt16LE(1, 22);        // моно
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

await mkdir(OUT, { recursive: true });
const files: [string, Float32Array][] = [];
for (const kind of Object.keys(HITS) as (keyof typeof HITS)[]) {
  for (let v = 1; v <= 3; v++) files.push([`${kind}${v}`, HITS[kind]()]);
}
files.push(['roll', roll()], ['crit', crit()], ['fumble', fumble()]);
let total = 0;
for (const [name, samples] of files) {
  const buf = wav(samples);
  total += buf.length;
  await writeFile(join(OUT, `${name}.wav`), buf);
}
console.log(`Готово: ${files.length} звуков, ${Math.round(total / 1024)} КБ`);

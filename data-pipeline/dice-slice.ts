// Нарезает запись броска (data-pipeline/dice/recording.wav — WAV, моно, 16 бит, 22050 Гц) на звуки в assets/sounds/dice:
// roll.wav — сам бросок без тишины по краям; felt/wood/die 1–3 — отдельные удары из записи
// (бортик — ниже по тону, кость о кость — выше). Камень, 20 и 1 остаются от npm run dice:sounds.
// Запуск: npm run dice:sounds (если нужен камень, 20 и 1), потом npm run dice:slice, потом npm run dice:scene.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets/sounds/dice');
const SR = 22050;
const WIN = 44;                 // окно поиска ударов, ~2 мс
const HIT_MAX = 0.09;           // самый длинный удар, с
const FADE = 0.012;             // плавное затухание в конце отрезка, с

function readWav(buf: Buffer): Float32Array {
  const channels = buf.readUInt16LE(22);
  const rate = buf.readUInt32LE(24);
  const bits = buf.readUInt16LE(34);
  if (channels !== 1 || rate !== SR || bits !== 16) throw new Error(`Нужен WAV моно, ${SR} Гц, 16 бит`);
  let off = 12;
  while (buf.toString('ascii', off, off + 4) !== 'data') off += 8 + buf.readUInt32LE(off + 4);
  const len = buf.readUInt32LE(off + 4) / 2;
  return Float32Array.from({ length: len }, (_, i) => buf.readInt16LE(off + 8 + i * 2) / 32768);
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
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

const peak = (b: Float32Array) => b.reduce((m, x) => Math.max(m, Math.abs(x)), 0) || 1;
const peakTo = (b: Float32Array, p: number) => {
  const k = p / peak(b);
  return b.map((x) => x * k);
};

/** Громкость по окнам, дБ. */
function envelope(s: Float32Array): number[] {
  const env: number[] = [];
  for (let i = 0; i < s.length; i += WIN) {
    let e = 0;
    for (let j = i; j < i + WIN && j < s.length; j++) e += s[j] * s[j];
    env.push(10 * Math.log10(e / WIN + 1e-12));
  }
  return env;
}

/** Начала ударов: резкий рост громкости. Отсчёты (сэмплы) и громкость. */
function onsets(s: Float32Array): { at: number; db: number }[] {
  const env = envelope(s);
  const out: { at: number; db: number }[] = [];
  let last = -99;
  for (let k = 5; k < env.length; k++) {
    const before = Math.max(...env.slice(k - 5, k));
    if (env[k] > -35 && env[k] - before > 5 && k - last > 10) {
      out.push({ at: Math.max(0, (k - 1) * WIN), db: env[k] });
      last = k;
    }
  }
  return out;
}

/** Отрезок с плавным концом (и короткой подводкой в начале — без щелчка). */
function cut(s: Float32Array, from: number, to: number): Float32Array {
  const part = s.slice(from, to);
  const fade = Math.min(part.length, Math.round(FADE * SR));
  for (let i = 0; i < fade; i++) part[part.length - 1 - i] *= i / fade;
  const attack = Math.min(part.length, Math.round(0.0005 * SR));
  for (let i = 0; i < attack; i++) part[i] *= i / attack;
  return part;
}

/** Смена высоты (и длины) пересэмплированием: rate > 1 — выше и короче. */
function resample(s: Float32Array, rate: number): Float32Array {
  const out = new Float32Array(Math.floor(s.length / rate));
  for (let i = 0; i < out.length; i++) {
    const x = i * rate, j = Math.floor(x), f = x - j;
    out[i] = s[j] * (1 - f) + (s[j + 1] ?? 0) * f;
  }
  return out;
}

const rec = readWav(await readFile(join(ROOT, 'data-pipeline/dice/recording.wav')));
const found = onsets(rec);
if (found.length < 3) throw new Error(`В записи найдено ударов: ${found.length}, нужно хотя бы 3`);
console.log(`Удары: ${found.map((o) => `${Math.round((o.at / SR) * 1000)} мс`).join(', ')}`);

// Три самых громких удара; каждый — до следующего удара, но не длиннее HIT_MAX
const hits = [...found]
  .map((o, i) => ({ ...o, end: Math.min(found[i + 1]?.at ?? rec.length, o.at + Math.round(HIT_MAX * SR)) }))
  .sort((a, b) => b.db - a.db)
  .slice(0, 3)
  .map((o) => peakTo(cut(rec, o.at, o.end), 0.8));

const files: [string, Float32Array][] = [];
hits.forEach((h, i) => {
  files.push([`felt${i + 1}`, h]);
  files.push([`wood${i + 1}`, peakTo(resample(h, 0.8), 0.8)]);
  files.push([`die${i + 1}`, peakTo(resample(h, 1.35), 0.8)]);
});

// Весь бросок: от первого удара до затухания ниже −50 дБ
const env = envelope(rec);
let tail = env.length - 1;
while (tail > 0 && env[tail] < -50) tail--;
files.push(['roll', peakTo(cut(rec, found[0].at, Math.min(rec.length, (tail + 1) * WIN + Math.round(0.05 * SR))), 0.8)]);

for (const [name, samples] of files) await writeFile(join(OUT, `${name}.wav`), wav(samples));
console.log(`Готово: ${files.map(([n]) => n).join(', ')}`);

/// <reference types="node" />
// Правила Feature-Sliced Design для этого проекта (проверяются на каждом запуске тестов).
//
// Слои снизу вверх: shared → entities → features → widgets → pages → app (корневая папка app/ — маршруты expo-router).
// 1. Слой импортирует только из слоёв ниже себя (shared — только из shared).
// 2. Слайсы одного слоя не импортируют друг друга (кроме сегментов shared).
// 3. Снаружи к слайсу обращаются только через его публичный API: '@/слой/слайс' или '@/слой/слайс/<сегмент>' с index.ts.
// 4. Внутри слайса — относительные импорты, не '@/…' на самого себя.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const LAYERS = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'] as const;
type Layer = (typeof LAYERS)[number];

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      return walk(p);
    }
    return /\.tsx?$/.test(e.name) && !e.name.endsWith('.d.ts') ? [p] : [];
  });
}

/** Слой и слайс файла: shared делится на сегменты (shared/ui, shared/lib/dice…). */
function locate(file: string): { layer: Layer; slice: string } {
  const rel = path.relative(ROOT, file).split(path.sep);
  if (rel[0] === 'app') {
    return { layer: 'app', slice: 'app' };
  }
  const [, layer, a, b] = rel;
  if (layer === 'shared') {
    return { layer, slice: a === 'lib' ? `shared/lib/${b}` : `shared/${a}` };
  }
  return { layer: layer as Layer, slice: `${layer}/${a}` };
}

const imports = (file: string) =>
  [...fs.readFileSync(file, 'utf8').matchAll(/(?:import|export)[^'"]*?from\s+'([^']+)'/g)].map((m) => m[1]);

const files = [...walk(SRC), ...walk(path.join(ROOT, 'app'))].filter(
  (f) => !f.includes('__tests__') && !f.endsWith('.test.ts'),
);

describe('архитектура FSD', () => {
  test('файлы лежат только в слоях FSD', () => {
    const stray = walk(SRC)
      .map((f) => path.relative(SRC, f).split(path.sep)[0])
      .filter((top) => !LAYERS.includes(top as Layer) && top !== 'architecture.test.ts');
    expect([...new Set(stray)]).toEqual([]);
  });

  test('импорты соблюдают правила слоёв, слайсов и публичных API', () => {
    const problems: string[] = [];
    for (const file of files) {
      const from = locate(file);
      const where = path.relative(ROOT, file);
      for (const spec of imports(file)) {
        if (!spec.startsWith('@/')) {
          continue;
        }
        const parts = spec.slice(2).split('/');
        const layer = parts[0] as Layer;
        const slice =
          layer === 'shared'
            ? parts[1] === 'lib'
              ? `shared/lib/${parts[2]}`
              : `shared/${parts[1]}`
            : `${layer}/${parts[1]}`;
        if (!LAYERS.includes(layer)) {
          problems.push(`${where}: неизвестный слой в '${spec}'`);
          continue;
        }
        if (slice === from.slice) {
          problems.push(`${where}: импорт своего слайса через '${spec}' — нужен относительный путь`);
          continue;
        }
        if (LAYERS.indexOf(layer) > LAYERS.indexOf(from.layer) || (layer === from.layer && layer !== 'shared')) {
          problems.push(`${where}: слой ${from.layer} не может импортировать '${spec}'`);
        }
        const depth = slice.split('/').length;
        const rest = parts.slice(depth);
        const segmentApi = rest.length === 1 && fs.existsSync(path.join(SRC, ...slice.split('/'), rest[0], 'index.ts'));
        if (rest.length > 0 && !segmentApi) {
          problems.push(`${where}: '${spec}' — в обход публичного API слайса ${slice}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

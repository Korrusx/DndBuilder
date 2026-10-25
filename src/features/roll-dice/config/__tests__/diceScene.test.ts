import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { DICE_SCENE_HTML } from '../diceScene.generated';

// Сцена собирается скриптом (npm run dice:scene) и в тестах не запускается (WebView, WebGL). Проверяем, что собранный
// файл совпадает с исходниками: его легко испортить массовой заменой по проекту, и тогда 3D-стол молча отключается.
const ROOT = join(__dirname, '../../../../..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

describe('собранная 3D-сцена', () => {
  test('код шаблона scene.html попал в сборку без изменений', () => {
    const template = read('data-pipeline/dice/scene.html');
    for (const part of template.split(/\/\*THREE\*\/|\/\*CANNON\*\/|\/\*SOUNDS\*\/\{\}/)) {
      expect(DICE_SCENE_HTML.includes(part)).toBe(true);
    }
  });

  test('three.js встроен без изменений', () => {
    const three = read('node_modules/three/build/three.min.js').replace(/<\/script/gi, '<\\/script');
    expect(DICE_SCENE_HTML.includes(three)).toBe(true);
  });

  test('звуки ударов совпадают с файлами assets/sounds/dice', () => {
    const json = DICE_SCENE_HTML.match(/var SOUNDS = (\{.*?\});/s)?.[1];
    const sounds: Record<string, string> = JSON.parse(json ?? '{}');
    expect(Object.keys(sounds)).toHaveLength(12);
    for (const [name, base64] of Object.entries(sounds)) {
      const file = readFileSync(join(ROOT, `assets/sounds/dice/${name}.wav`)).toString('base64');
      expect({ name, same: base64 === file }).toEqual({ name, same: true });
    }
  });
});

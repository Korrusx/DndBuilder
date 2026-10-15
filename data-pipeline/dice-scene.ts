// Собирает стол бросков (к4–к20) (data-pipeline/dice/scene.html) вместе с three.js, cannon-es и звуками ударов
// (assets/sounds/dice, npm run dice:sounds) в одну HTML-строку
// src/features/roll-dice/config/diceScene.generated.ts — сцена открывается в WebView без интернета.
// Запуск: npm run dice:scene (нужен только при правке сцены или смене версий библиотек).

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p: string) => readFile(join(ROOT, p), 'utf8');
// Код вставляется внутрь <script>: «</script» в нём закрыл бы тег раньше времени.
const safe = (code: string) => code.replace(/<\/script/gi, '<\\/script');

const three = await read('node_modules/three/build/three.min.js');
// ES-модуль cannon-es превращаем в тело функции: единственный «export { … }» в конце становится «return { … }».
// (Сборка CommonJS не подходит: она требует модуль Node perf_hooks.)
const cannonModule = await read('node_modules/cannon-es/dist/cannon-es.js');
const exportLine = /^export \{([^}]*)\};?\s*$/m;
if ((cannonModule.match(/^\s*(import|export)\b/gm) ?? []).length !== 1 || !exportLine.test(cannonModule)) {
  throw new Error('cannon-es: неожиданный формат модуля, проверьте сборку сцены');
}
const cannon = cannonModule.replace(exportLine, 'return {$1};');
const versions = {
  three: JSON.parse(await read('node_modules/three/package.json')).version,
  cannon: JSON.parse(await read('node_modules/cannon-es/package.json')).version,
};
// Стук костей: по 3 варианта на каждую поверхность, WAV в base64
const sounds: Record<string, string> = {};
for (const kind of ['felt', 'stone', 'wood', 'die']) {
  for (let v = 1; v <= 3; v++) {
    sounds[`${kind}${v}`] = (await readFile(join(ROOT, `assets/sounds/dice/${kind}${v}.wav`))).toString('base64');
  }
}
const html = (await read('data-pipeline/dice/scene.html'))
  .replace('/*THREE*/', () => safe(three))
  .replace('/*CANNON*/', () => safe(cannon))
  .replace('/*SOUNDS*/{}', () => JSON.stringify(sounds));

await writeFile(
  join(ROOT, 'src/features/roll-dice/config/diceScene.generated.ts'),
  `// Сгенерировано data-pipeline/dice-scene.ts — не править руками.\n` +
    `// three.js ${versions.three} и cannon-es ${versions.cannon}, лицензия MIT.\n\n` +
    `export const DICE_SCENE_HTML =\n  ${JSON.stringify(html)};\n`,
);
console.log(`Готово: ${Math.round(html.length / 1024)} КБ`);

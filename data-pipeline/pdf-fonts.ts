// Встраивает шрифты листа PDF (assets/fonts/pdf/*.woff2) в src/features/export-pdf/config/fonts.generated.ts как @font-face с data-URI,
// чтобы PDF собирался без интернета. Запуск: npm run pdf:fonts (нужен только при смене шрифтов).

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'assets/fonts/pdf');

// Латиница и кириллица Alegreya SC лежат в разных файлах: делаем два семейства, браузер берёт символ из того, где он есть.
const FACES: { family: string; file: string; weight: number; style?: string }[] = [
  { family: 'SheetHead', file: 'alegreya-sc-latin-400-normal.woff2', weight: 400 },
  { family: 'SheetHead', file: 'alegreya-sc-latin-700-normal.woff2', weight: 700 },
  { family: 'SheetHeadCyr', file: 'alegreya-sc-cyrillic-400-normal.woff2', weight: 400 },
  { family: 'SheetHeadCyr', file: 'alegreya-sc-cyrillic-700-normal.woff2', weight: 700 },
  { family: 'SheetText', file: 'IBMPlexSansCondensed-Regular.woff2', weight: 400 },
  { family: 'SheetText', file: 'IBMPlexSansCondensed-SemiBold.woff2', weight: 600 },
  { family: 'SheetText', file: 'IBMPlexSansCondensed-Italic.woff2', weight: 400, style: 'italic' },
];

const css: string[] = [];
for (const f of FACES) {
  const b64 = (await readFile(join(DIR, f.file))).toString('base64');
  css.push(
    `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:${f.style ?? 'normal'};src:url(data:font/woff2;base64,${b64}) format('woff2');}`,
  );
}

await writeFile(
  join(ROOT, 'src/features/export-pdf/config/fonts.generated.ts'),
  `// Сгенерировано data-pipeline/pdf-fonts.ts — не править руками.\n// Alegreya SC и IBM Plex Sans Condensed, лицензия SIL OFL 1.1 (assets/fonts/pdf/OFL-*.txt).\n\nexport const PDF_FONT_CSS =\n  ${JSON.stringify(css.join('\n'))};\n`,
);
console.log(`Шрифты листа встроены: ${FACES.length} начертаний`);

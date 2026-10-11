// Скачивает справочник SRD 5.2 из dnd5eapi (раздел 2024) в data-pipeline/raw/*.json.
// Запуск: npm run data:fetch
// Запускается один раз (или когда нужно обновить сырые данные). Приложение к API не обращается.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://www.dnd5eapi.co';
const RAW_DIR = join(dirname(fileURLToPath(import.meta.url)), 'raw');
const CONCURRENCY = 4;

const RESOURCES = [
  'ability-scores',
  'alignments',
  'backgrounds',
  'classes',
  'subclasses',
  'species',
  'subspecies',
  'traits',
  'feats',
  'features',
  'skills',
  'proficiencies',
  'languages',
  'conditions',
  'damage-types',
  'equipment',
  'equipment-categories',
  'weapon-properties',
  'weapon-mastery-properties',
  'magic-schools',
  'spells',
  'magic-items',
];

type ApiRef = { index: string; name: string; url: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(path: string, attempt = 1): Promise<any> {
  const res = await fetch(API + path);
  if (res.status === 429 || res.status >= 500) {
    if (attempt > 6) throw new Error(`${res.status} ${path}`);
    await sleep(1000 * 2 ** attempt);
    return getJson(path, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

/** Выполняет задачи с ограничением на число одновременных запросов. */
async function mapLimited<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return out;
}

/** Убираем служебные поля, которые меняются без изменения содержания. */
function clean(value: any): any {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === 'updated_at') continue;
      out[k] = clean(v);
    }
    return out;
  }
  return value;
}

async function save(name: string, data: unknown) {
  const file = join(RAW_DIR, `${name}.json`);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(clean(data), null, 2) + '\n');
}

async function fetchResource(resource: string) {
  const list: { results: ApiRef[] } = await getJson(`/api/2024/${resource}`);
  const missing: string[] = [];
  const items = await mapLimited(list.results, (ref) =>
    getJson(ref.url).catch((err: Error) => {
      // В API есть битые ссылки (элемент в списке есть, а по адресу 404) — пропускаем их.
      if (!err.message.startsWith('404')) throw err;
      // Оставляем заглушку с индексом из адреса и названием из списка.
      const index = ref.url.split('/').pop()!;
      missing.push(index);
      return { index, name: ref.name, missing: true };
    }),
  );
  if (missing.length) console.warn(`  ! ${resource}: нет данных (404), сохранены заглушки: ${missing.join(', ')}`);
  items.sort((a, b) => a.index.localeCompare(b.index));
  await save(resource, items);
  console.log(`  ${resource}: ${items.length}`);
  return items;
}

async function main() {
  console.log(`Скачиваю справочник из ${API}/api/2024 …`);
  for (const resource of RESOURCES) {
    const items = await fetchResource(resource);
    if (resource === 'classes') {
      const levels = await mapLimited(items, (c: any) => getJson(`/api/2024/classes/${c.index}/levels`));
      await save('class-levels', levels.flat());
      console.log(`  class-levels: ${levels.flat().length}`);
    }
  }
  console.log(`Готово: ${RAW_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

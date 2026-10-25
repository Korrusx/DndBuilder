import en from '../../locales/en.json';
import ru from '../../locales/ru.json';

const TRADEMARKS = /D&D|DnD|Dnd|ДнД|Днд|Dungeons|Подземелья и драконы/;
// Ссылки на SRD в атрибуции — разрешены.
const ALLOWED_LINKS = /https?:\/\/(www\.dndbeyond\.com|dnd\.wizards\.com)\S*/g;

/** Все строки словаря с путями ключей. */
function strings(dict: object, prefix = ''): [string, string][] {
  return Object.entries(dict).flatMap(([key, value]): [string, string][] =>
    typeof value === 'string' ? [[prefix + key, value]] : strings(value, `${prefix}${key}.`),
  );
}

test.each([
  ['ru', ru],
  ['en', en],
])('%s: в текстах интерфейса нет товарных знаков', (_, dict) => {
  const found = strings(dict).filter(([, text]) => TRADEMARKS.test(text.replace(ALLOWED_LINKS, '')));
  expect(found).toEqual([]);
});

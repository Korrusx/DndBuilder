import en from '../../locales/en.json';
import ru from '../../locales/ru.json';
import { i18n } from '../i18n';

/** Ключи словаря без суффиксов множественного числа (_one, _few, _many, _other). */
function keys(dict: object, prefix = ''): Set<string> {
  const out = new Set<string>();
  for (const [k, v] of Object.entries(dict)) {
    const key = prefix + k.replace(/_(zero|one|two|few|many|other)$/, '');
    if (v && typeof v === 'object') keys(v, `${key}.`).forEach((x) => out.add(x));
    else out.add(key);
  }
  return out;
}

test('в английском и русском словарях одинаковые ключи', () => {
  const r = keys(ru);
  const e = keys(en);
  expect([...r].filter((k) => !e.has(k))).toEqual([]);
  expect([...e].filter((k) => !r.has(k))).toEqual([]);
});

describe('склонения по числам', () => {
  afterEach(() => i18n.changeLanguage('ru'));

  test('русский: один / несколько / много', () => {
    expect(i18n.t('issues.expertise', { count: 1 })).toBe('Выберите компетентность: 1 навык');
    expect(i18n.t('issues.expertise', { count: 2 })).toBe('Выберите компетентность: 2 навыка');
    expect(i18n.t('issues.expertise', { count: 5 })).toBe('Выберите компетентность: 5 навыков');
  });

  test('английский: один / много', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('issues.expertise', { count: 1 })).toBe('Choose Expertise: 1 skill');
    expect(i18n.t('issues.expertise', { count: 2 })).toBe('Choose Expertise: 2 skills');
  });
});

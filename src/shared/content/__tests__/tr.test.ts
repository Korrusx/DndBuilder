import { i18n } from '@/shared/i18n';

import { content, contentFor, localizeText } from '../content';

describe('localizeText: текст справочника на текущем языке', () => {
  afterEach(() => i18n.changeLanguage('ru'));

  test('по умолчанию — русский', () => {
    expect(localizeText({ en: 'Shield', ru: 'Щит' })).toEqual({ text: 'Щит', translated: true });
  });

  test('без перевода — английский с пометкой', () => {
    expect(localizeText({ en: 'Shield' })).toEqual({ text: 'Shield', translated: false });
  });

  test('английский язык — оригинал', async () => {
    await i18n.changeLanguage('en');
    expect(localizeText({ en: 'Shield', ru: 'Щит' })).toEqual({ text: 'Shield', translated: true });
  });

  test('английский язык, но английского текста нет — русский с пометкой', async () => {
    await i18n.changeLanguage('en');
    expect(localizeText({ en: '', ru: 'Щит' })).toEqual({ text: 'Щит', translated: false });
  });

  test('в справочнике у каждого текста есть английский вариант (без кириллицы)', () => {
    const bad: string[] = [];
    const walk = (v: unknown, path: string) => {
      if (Array.isArray(v)) {
        v.forEach((x, i) => walk(x, `${path}[${i}]`));
      } else if (v && typeof v === 'object') {
        const t = v as { en?: unknown };
        if (typeof t.en === 'string') {
          if (/[А-Яа-яЁё]/.test(t.en)) {
            bad.push(path);
          }
        } else {
          Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`));
        }
      }
    };
    walk(content, 'content');
    walk(contentFor('2014'), 'content2014');
    expect(bad).toEqual([]);
  });

  test('пустой текст', () => expect(localizeText(undefined)).toEqual({ text: '', translated: true }));
});

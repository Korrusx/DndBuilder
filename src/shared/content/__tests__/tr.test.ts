import { i18n } from '@/shared/i18n/model';

import { tr } from '../content';

describe('tr: текст справочника на текущем языке', () => {
  afterEach(() => i18n.changeLanguage('ru'));

  test('по умолчанию — русский', () => {
    expect(tr({ en: 'Shield', ru: 'Щит' })).toEqual({ text: 'Щит', translated: true });
  });

  test('без перевода — английский с пометкой', () => {
    expect(tr({ en: 'Shield' })).toEqual({ text: 'Shield', translated: false });
  });

  test('английский язык — оригинал', async () => {
    await i18n.changeLanguage('en');
    expect(tr({ en: 'Shield', ru: 'Щит' })).toEqual({ text: 'Shield', translated: true });
  });

  test('английский язык, но оригинала нет (механика из extra) — русский текст с пометкой', async () => {
    await i18n.changeLanguage('en');
    expect(tr({ en: 'Небесная стойкость', ru: 'Небесная стойкость' })).toEqual({ text: 'Небесная стойкость', translated: false });
  });

  test('пустой текст', () => expect(tr(undefined)).toEqual({ text: '', translated: true }));
});

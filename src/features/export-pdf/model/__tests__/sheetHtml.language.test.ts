import { irmaLevel1 } from '@/entities/character';
import { content } from '@/shared/content';
import { i18n } from '@/shared/i18n/model';

import { characterSheetHtml } from '../sheetHtml';

const CYRILLIC = /[А-Яа-яЁё]+/g;

describe('лист PDF на выбранном языке', () => {
  afterEach(() => i18n.changeLanguage('ru'));

  test('по-английски — без русского текста (кроме имени персонажа)', async () => {
    await i18n.changeLanguage('en');
    const irma = { ...irmaLevel1(), name: 'Irma Vale', notes: '' };
    const html = characterSheetHtml(irma, content);
    expect(html.match(CYRILLIC)).toBeNull();
    expect(html).toContain('Armor Class');
    expect(html).toContain('1d6+3');
  });

  test('по-русски — русские подписи и кости «к»', () => {
    const html = characterSheetHtml(irmaLevel1(), content);
    expect(html).toContain('Класс защиты');
    expect(html).toContain('1к6+3');
  });
});

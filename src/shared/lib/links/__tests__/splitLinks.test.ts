import { splitLinks } from '../splitLinks';

const ZWSP = '​';

describe('ссылки в тексте', () => {
  test('текст без ссылок — один кусок', () => {
    expect(splitLinks('Лицензия MIT.')).toEqual([{ text: 'Лицензия MIT.' }]);
  });

  test('точка в конце предложения не входит в адрес', () => {
    expect(splitLinks('См. https://www.dndbeyond.com/srd. Далее')).toEqual([
      { text: 'См. ' },
      { text: `https:/${ZWSP}/${ZWSP}www.dndbeyond.com/${ZWSP}srd`, url: 'https://www.dndbeyond.com/srd' },
      { text: '. Далее' },
    ]);
  });

  test('несколько ссылок подряд', () => {
    const urls = splitLinks('a https://x.org/1, b http://y.org/2/)').filter((part) => part.url);
    expect(urls.map((part) => part.url)).toEqual(['https://x.org/1', 'http://y.org/2/']);
  });

  test('без пробелов нулевой ширины текст совпадает с исходным', () => {
    const text = 'available at https://creativecommons.org/licenses/by/4.0/legalcode.';
    expect(
      splitLinks(text)
        .map((part) => part.text)
        .join('')
        .replaceAll(ZWSP, ''),
    ).toBe(text);
  });
});

import en from '../../locales/en.json';
import ru from '../../locales/ru.json';

// Оригинальная атрибуция SRD по требованию лицензии CC BY 4.0: английский текст, без перевода и правок.
const SRD_ORIGINAL =
  'This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, ' +
  'available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 ' +
  'International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.';
const SRD51_ORIGINAL =
  'This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC ' +
  'and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the ' +
  'Creative Commons Attribution 4.0 International License available at ' +
  'https://creativecommons.org/licenses/by/4.0/legalcode.';

describe('атрибуция SRD в «О приложении»', () => {
  test.each([
    ['ru', ru],
    ['en', en],
  ])('%s: оригинальный текст SRD 5.2 и SRD 5.1 без изменений', (_, dict) => {
    expect(dict.about.srdOriginal).toBe(SRD_ORIGINAL);
    expect(dict.about.srd51Original).toBe(SRD51_ORIGINAL);
  });
});

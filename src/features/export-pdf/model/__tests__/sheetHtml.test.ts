import { irmaLevel1 } from '@/entities/character/lib/samples';
import { content } from '@/shared/content/content';
import { characterSheetHtml, escapeHtml, sheetSpells } from '../sheetHtml';

describe('лист персонажа для PDF', () => {
  const html = characterSheetHtml(irmaLevel1(), content);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  test('две страницы A4', () => {
    expect(html.match(/class="page"/g)).toHaveLength(2);
    expect(html).toContain('size: A4');
  });

  test('числа Ирмы из контрольного примера', () => {
    expect(text).toContain('Ирма Вейл');
    expect(text).toMatch(/10 Максимум/); // хиты
    expect(text).toMatch(/14 Класс защиты/);
    expect(text).toMatch(/\+5 Инициатива/);
    expect(text).toMatch(/13 Пассивное восприятие/);
    expect(text).toMatch(/\+7 Скрытность/);
    expect(text).toMatch(/\+7 Ловкость рук/);
    expect(text).toMatch(/\+5 Спасбросок/);
    expect(text).toContain('1к6+3');
    expect(text).toContain('1к4+3');
  });

  test('текущие и временные хиты пустые', () => {
    expect(html).toMatch(/<div class="hpcell blank"><div class="big">&nbsp;<\/div><div class="lbl">Текущие/);
    expect(html).toMatch(/<div class="hpcell blank"><div class="big">&nbsp;<\/div><div class="lbl">Временные/);
  });

  test('ячейки на бланке: 4-3-3-3-3-2-2-1-1 кружков', () => {
    const slots = [...html.matchAll(/<div class="box slot">.*?<\/div><div class="marks">(.*?)<\/div>/g)].map((m) => (m[1].match(/<span/g) ?? []).length);
    expect(slots).toEqual([4, 3, 3, 3, 3, 2, 2, 1, 1]);
  });

  test('заклинания волшебника: заговоры первыми, затем по кругу', () => {
    const wiz = { ...irmaLevel1(), classes: [{ classId: 'wizard', level: 1 }], cantrips: ['light'], preparedSpells: ['shield', 'magic-missile'] };
    const list = sheetSpells(wiz, content).map((s) => s.spell.id);
    expect(list[0]).toBe('light');
    expect(list.slice(1).sort()).toEqual(['magic-missile', 'shield']);
  });

  test('имя экранируется', () => {
    expect(escapeHtml('<b>&"')).toBe('&lt;b&gt;&amp;&quot;');
    expect(characterSheetHtml({ ...irmaLevel1(), name: '<script>' }, content)).not.toContain('<script>');
  });
});

import { computeSheet, irmaLevel1 } from '@/entities/character';
import { content } from '@/shared/content';
import { buildExchange, exchangeFileName, ImportError, parseExchange } from '../exchange';

const NOW = '2026-10-11T12:00:00.000Z';
let n = 0;
const makeId = () => `new-${++n}`;
const parse = (data: unknown) => parseExchange(typeof data === 'string' ? data : JSON.stringify(data), content, makeId, NOW);

describe('файл обмена персонажами', () => {
  test('экспорт → импорт: тот же персонаж с новым id, числа не меняются', () => {
    const irma = { ...irmaLevel1(), state: { ...irmaLevel1().state, currentHp: 4 } };
    const file = buildExchange([irma], NOW, content.version);
    const { characters, warnings } = parse(file);
    expect(warnings).toEqual([]);
    expect(characters).toHaveLength(1);
    const back = characters[0];
    expect(back.id).not.toBe(irma.id);
    expect(back.updatedAt).toBe(NOW);
    expect(back.state.currentHp).toBe(4);
    expect({ ...back, id: irma.id, updatedAt: irma.updatedAt }).toEqual(irma);
    expect(computeSheet(back, content).maxHp).toBe(10);
  });

  test('недостающие поля (файл старой версии) заполняются по умолчанию', () => {
    const { state, weaponMasteries, ...old } = irmaLevel1();
    void weaponMasteries;
    const { resourcesSpent, ...oldState } = state;
    void resourcesSpent;
    const [c] = parse(buildExchange([{ ...old, state: oldState } as never], NOW, 'x')).characters;
    expect(c.weaponMasteries).toEqual([]);
    expect(c.state.resourcesSpent).toEqual({});
  });

  test('метка BOM и пробелы по краям не мешают', () => {
    const text = '\uFEFF  ' + JSON.stringify(buildExchange([irmaLevel1()], NOW, 'x')) + '\n';
    expect(parse(text).characters).toHaveLength(1);
  });

  test('в ошибке видно, что прочитано', () => {
    expect(() => parse('<html>страница</html>')).toThrow('Начало: «<html>страница</html>»');
    expect(() => parse('%PDF-1.4 бинарные данные')).toThrow('Это PDF-лист для печати');
    expect(() => parse('')).toThrow('Файл пустой.');
  });

  test('чужие и повреждённые файлы отклоняются понятной ошибкой', () => {
    expect(() => parse('не json')).toThrow(ImportError);
    expect(() => parse({ hello: 1 })).toThrow('не файл персонажей нашего приложения');
    expect(() => parse({ ...buildExchange([irmaLevel1()], NOW, 'x'), version: 99 })).toThrow('более новой версией');
    expect(() => parse(buildExchange([], NOW, 'x'))).toThrow('нет персонажей');
  });

  test('плохие записи пропускаются, хорошие загружаются', () => {
    const bad = { ...irmaLevel1(), name: 'Призрак', classes: [{ classId: 'necromancer', level: 1 }] };
    const broken = { name: 'Обломок', classes: 'плут' };
    const { characters, warnings } = parse(buildExchange([bad, broken as never, irmaLevel1()], NOW, 'x'));
    expect(characters.map((c) => c.name)).toEqual(['Ирма Вейл']);
    expect(warnings).toEqual([
      'Персонаж «Призрак» пропущен: в справочнике нет — класс necromancer.',
      'Персонаж «Обломок» пропущен: нет классов.',
    ]);
  });

  test('неизвестные заклинания и предметы — предупреждение, персонаж загружается', () => {
    const c = { ...irmaLevel1(), preparedSpells: ['homebrew-bolt'], equipment: [...irmaLevel1().equipment, { itemId: 'laser-sword', quantity: 1 }] };
    const { characters, warnings } = parse(buildExchange([c], NOW, 'x'));
    expect(characters).toHaveLength(1);
    expect(warnings).toEqual(['У персонажа «Ирма Вейл» не найдено в справочнике: homebrew-bolt, laser-sword.']);
  });

  test('если загрузить нечего — ошибка со списком причин', () => {
    expect(() => parse(buildExchange([{ ...irmaLevel1(), speciesId: 'robot' }], NOW, 'x'))).toThrow(/вид robot/);
  });

  test('имя файла', () => {
    expect(exchangeFileName([irmaLevel1()], NOW)).toBe('Ирма Вейл.dnd.json');
    expect(exchangeFileName([irmaLevel1(), irmaLevel1()], NOW)).toBe('Персонажи 2026-10-11.dnd.json');
    expect(exchangeFileName([{ ...irmaLevel1(), name: 'a/b:c' }], NOW)).toBe('a b c.dnd.json');
  });
});

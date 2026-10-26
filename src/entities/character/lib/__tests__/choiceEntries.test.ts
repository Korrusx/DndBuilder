import { content } from '@/shared/content';

import {
  backgroundEntries,
  classOptionEntries,
  descriptionSummary,
  equipmentEntries,
  featEntries,
  languageEntries,
  masteryEntries,
  speciesEntries,
} from '../choiceEntries';

describe('варианты выбора с описаниями', () => {
  test('сводка описания: заголовки преимуществ или первое предложение', () => {
    const alert = content.feats.find((f) => f.id === 'alert')!;
    expect(descriptionSummary(alert.description)).toBe('Мастерство в инициативе · Обмен инициативой');
    const archery = content.feats.find((f) => f.id === 'archery')!;
    expect(descriptionSummary(archery.description)).toBe('Вы получаете бонус +2 к броскам атаки дальнобойным оружием.');
  });

  test('черта: тип и условие в подзаголовке, полный текст в шторке', () => {
    const [asi] = featEntries(['ability-score-improvement'], content);
    expect(asi.title).toBe('Увеличение характеристик');
    expect(asi.detail.subtitle).toBe('Общая черта · Условие: 4 уровень');
    expect(asi.detail.text).toContain('Увеличьте одну характеристику');
  });

  test('приём оружия: приём и урон в сводке, плитки оружия', () => {
    const [battleaxe] = masteryEntries(['battleaxe'], content);
    expect(battleaxe.summary).toBe('Опрокидывание · 1к8 рубящий');
    expect(battleaxe.detail.tiles?.[0]).toEqual({ label: 'Урон', value: '1к8 рубящий' });
    expect(battleaxe.detail.text.length).toBeGreaterThan(20);
  });

  test('языки: стандартный или редкий', () => {
    const entries = languageEntries(['primordial', 'dwarvish'], content);
    expect(entries.map((e) => e.summary)).toEqual(['Стандартный язык', 'Редкий язык']);
    expect(entries[1].detail.text).toContain('акван');
  });

  test('вид: скорость и размер; особенности — разделами шторки', () => {
    const halfling = speciesEntries(content).find((e) => e.id === 'halfling')!;
    expect(halfling.summary).toBe('30 фт · Маленький');
    expect(halfling.detail.sections?.map((s) => s.title)).toContain('Удача');
  });

  test('предыстория «Преступник»: характеристики, черта, навыки', () => {
    const criminal = backgroundEntries(content).find((e) => e.id === 'criminal')!;
    expect(criminal.summary).toBe('ЛОВ, ТЕЛ, ИНТ · Бдительность · Ловкость рук, Скрытность, Воровские инструменты');
    expect(criminal.detail.sections?.[0]?.title).toBe('Бдительность');
  });

  test('воззвание: вид и условие; предмет: урон и цена', () => {
    const options = content.classOptions.filter((o) => o.id === 'agonizing-blast');
    expect(classOptionEntries(options, content)[0].detail.subtitle).toMatch(/^Воззвание · Условие: /);
    expect(equipmentEntries(['dagger'], content)[0].summary).toBe('1к4 колющий · 2 зм');
  });
});

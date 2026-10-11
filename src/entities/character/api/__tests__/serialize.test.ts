import { irmaLevel1 } from '../../lib/samples';
import { newDraftCharacter } from '../../model/character';
import { characterToRow, rowToCharacter } from '../serialize';

describe('сохранение персонажа', () => {
  test('туда и обратно без потерь', () => {
    const irma = irmaLevel1();
    const row = characterToRow(irma);
    expect(row).toMatchObject({ id: 'irma', name: 'Ирма Вейл', status: 'ready', draft_step: null });
    expect(rowToCharacter(row)).toEqual(irma);
  });

  test('номер шага черновика', () => {
    const draft = { ...newDraftCharacter('d', '2026-01-01T00:00:00.000Z'), status: { kind: 'draft', step: 3 } } as const;
    expect(characterToRow(draft)).toMatchObject({ status: 'draft', draft_step: 3 });
  });

  test('старый JSON без новых полей дополняется значениями по умолчанию', () => {
    const row = characterToRow(irmaLevel1());
    const old = JSON.parse(row.data);
    delete old.weaponMasteries;
    delete old.state.heroicInspiration;
    const c = rowToCharacter({ ...row, data: JSON.stringify(old) });
    expect(c.weaponMasteries).toEqual([]);
    expect(c.state.heroicInspiration).toBe(false);
    expect(c.name).toBe('Ирма Вейл');
  });
});

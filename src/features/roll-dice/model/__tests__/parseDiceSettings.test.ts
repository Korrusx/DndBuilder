import { DEFAULT_DICE_SETTINGS } from '../../config/diceSettings';
import { parseDiceSettings } from '../parseDiceSettings';

describe('настройки бросков', () => {
  test('без сохранённых настроек — значения по умолчанию', () => {
    expect(parseDiceSettings(null)).toEqual(DEFAULT_DICE_SETTINGS);
  });

  test('сохранённые значения читаются', () => {
    const saved = { style: 'simple', animation: false, skin: 'bone', table: 'stone', sound: false };
    expect(parseDiceSettings(JSON.stringify(saved))).toEqual(saved);
  });

  test('испорченные и неизвестные значения заменяются значениями по умолчанию', () => {
    expect(parseDiceSettings('{не json')).toEqual(DEFAULT_DICE_SETTINGS);
    expect(parseDiceSettings(JSON.stringify({ style: 'vr', animation: 'да', skin: 'gold' }))).toEqual(
      DEFAULT_DICE_SETTINGS,
    );
    expect(parseDiceSettings(JSON.stringify({ animation: false })).animation).toBe(false);
    expect(parseDiceSettings(JSON.stringify({ sound: 'громко' })).sound).toBe(true);
  });
});

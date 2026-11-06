import { isShake } from '../shake';

jest.mock('expo-sensors', () => ({ Accelerometer: { setUpdateInterval: jest.fn(), addListener: jest.fn() } }));

describe('встряхивание', () => {
  test('порог 1,8 g', () => {
    expect(isShake({ x: 0, y: 0, z: 1 }, 10_000, 0)).toBe(false); // телефон лежит
    expect(isShake({ x: 1.5, y: 1, z: 0.5 }, 10_000, 0)).toBe(true);
  });
  test('не чаще раза в 1,5 с', () => {
    expect(isShake({ x: 2, y: 0, z: 0 }, 1_000, 0)).toBe(false);
    expect(isShake({ x: 2, y: 0, z: 0 }, 1_500, 0)).toBe(true);
  });
});

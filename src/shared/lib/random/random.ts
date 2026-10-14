import { getRandomValues } from 'expo-crypto';

/**
 * Случайное число в [0, 1) из криптографического генератора устройства (53 бита — как у Math.random,
 * перекос при выборе грани кости пренебрежимо мал). Подходит как `rng` для rollD20 и rollDamage.
 */
export function secureRandom(): number {
  const [hi, lo] = getRandomValues(new Uint32Array(2));
  return ((hi >>> 5) * 67108864 + (lo >>> 6)) / 9007199254740992;
}

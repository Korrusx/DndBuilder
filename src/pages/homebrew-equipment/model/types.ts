import type { HombrewEquipment } from '@/features/homebrew-equipment';

export type Coin = 'gp' | 'sp' | 'cp';

export type FormState = Omit<HombrewEquipment, 'id' | 'createdAt'>;

export function emptyForm(): FormState {
  return {
    nameRu: '',
    descriptionRu: '',
    weight: null,
    costAmount: 0,
    costUnit: 'gp',
    kind: 'gear',
    weaponDamageDice: '1к6',
    weaponDamageType: 'рубящий',
    weaponRangeType: 'melee',
    weaponCategory: 'simple',
    weaponIsLight: false,
    weaponIsTwoHanded: false,
    weaponIsFinesse: false,
    weaponIsThrown: false,
    additionalDamageDice: '',
    additionalDamageType: 'огнём',
    armorCategory: 'light',
    armorBase: 11,
    armorStealthDisadvantage: false,
    magicBonus: 0,
  };
}

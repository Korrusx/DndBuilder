import { spendCoins, walletValue } from '../wallet';

describe('кошелёк', () => {
  test('60 зм, внести 50 → 10 зм; внести 30 при 10 → нельзя', () => {
    const after = spendCoins({ gp: 60 }, 50);
    expect(after).toEqual({ gp: 10 });
    expect(spendCoins(after!, 30)).toBeNull();
  });

  test('сколько в кошельке в золотых', () => {
    expect(walletValue({ pp: 1, gp: 5, sp: 19, cp: 3 })).toBe(16);
  });

  test('не хватает золота — мелкие монеты, потом размен платины со сдачей', () => {
    expect(spendCoins({ gp: 2, sp: 30 }, 4)).toEqual({ gp: 0, sp: 10 });
    expect(spendCoins({ gp: 1, pp: 1 }, 5)).toEqual({ gp: 6, pp: 0 });
    expect(spendCoins({ sp: 3, ep: 2 }, 1)).toEqual({ sp: 3, ep: 0 });
    expect(spendCoins({ sp: 3, ep: 1 }, 1)).toBeNull();
    expect(spendCoins({ cp: 5, sp: 9, ep: 1 }, 1)).toEqual({ cp: 5, sp: 4, ep: 0 });
  });
});

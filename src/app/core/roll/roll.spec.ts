import { D20_SIDES, rewardFor } from './roll';

describe('tabela da Rolagem Crítica', () => {
  const faces = Array.from({ length: D20_SIDES }, (_, i) => i + 1);

  it('premia todas as vinte faces', () => {
    for (const face of faces) {
      expect(rewardFor(face).headline).toBeTruthy();
    }
  });

  it('separa as faixas nos limites combinados', () => {
    expect(rewardFor(1).tier).toBe('floor');
    expect(rewardFor(9).tier).toBe('floor');
    expect(rewardFor(10).tier).toBe('shipping');
    expect(rewardFor(17).tier).toBe('shipping');
    expect(rewardFor(18).tier).toBe('gift');
    expect(rewardFor(19).tier).toBe('gift');
    expect(rewardFor(20).tier).toBe('critical');
  });

  it('só libera frete grátis de graça a partir de 10', () => {
    expect(rewardFor(9).freeShipping).toBe(false);
    expect(rewardFor(9).shippingFrom).toBe(149);
    expect(rewardFor(10).freeShipping).toBe(true);
  });

  it('reserva o brinde para 18 ou mais', () => {
    expect(faces.filter((face) => rewardFor(face).gift)).toEqual([18, 19, 20]);
  });

  it('nunca melhora quando a rolagem piora', () => {
    const rank: Record<string, number> = { floor: 0, shipping: 1, gift: 2, critical: 3 };
    const ranks = faces.map((face) => rank[rewardFor(face).tier]);

    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});

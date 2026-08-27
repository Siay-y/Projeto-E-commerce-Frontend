import { discountPercent, formatBRL, installmentsFor } from './money';

const plain = (value: string) => value.replace(/ /g, ' ');

describe('formatBRL', () => {
  it('formata em real brasileiro', () => {
    expect(plain(formatBRL(149.9))).toBe('R$ 149,90');
  });

  it('agrupa milhar com ponto', () => {
    expect(plain(formatBRL(1299))).toBe('R$ 1.299,00');
  });
});

describe('installmentsFor', () => {
  it('não parcela o que não alcança duas parcelas', () => {
    expect(installmentsFor(39.9)).toBeNull();
  });

  it('divide pelo maior número de parcelas acima do mínimo', () => {
    expect(installmentsFor(149.9)).toEqual({ count: 7, value: 21.42 });
  });

  it('não passa do teto de doze parcelas', () => {
    expect(installmentsFor(749)?.count).toBe(12);
  });

  it('arredonda a parcela para cima, nunca para baixo', () => {
    const parcel = installmentsFor(749);
    expect(parcel!.value * parcel!.count).toBeGreaterThanOrEqual(749);
  });
});

describe('discountPercent', () => {
  it('calcula o desconto em pontos inteiros', () => {
    expect(discountPercent(149.9, 199.9)).toBe(25);
  });

  it('é zero sem preço anterior', () => {
    expect(discountPercent(149.9, undefined)).toBe(0);
  });

  it('é zero quando o preço anterior não é maior', () => {
    expect(discountPercent(149.9, 149.9)).toBe(0);
    expect(discountPercent(149.9, 100)).toBe(0);
  });
});

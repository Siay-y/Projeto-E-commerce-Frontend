const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const MIN_INSTALLMENT = 20;
const MAX_INSTALLMENTS = 12;

export interface Installment {
  readonly count: number;
  readonly value: number;
}

export function formatBRL(value: number): string {
  return BRL.format(value);
}

export function installmentsFor(price: number): Installment | null {
  const count = Math.min(MAX_INSTALLMENTS, Math.floor(price / MIN_INSTALLMENT));
  if (count < 2) return null;

  return { count, value: Math.ceil((price / count) * 100) / 100 };
}

export function discountPercent(price: number, compareAt: number | undefined): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

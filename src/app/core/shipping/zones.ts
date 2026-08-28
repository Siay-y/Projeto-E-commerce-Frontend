export type Zone = 'sudeste' | 'sul' | 'centro-oeste' | 'nordeste' | 'norte';

interface Band {
  readonly upTo: number;
  readonly zone: Zone;
}

/**
 * Faixas de CEP por região.
 *
 * Rondônia (76800 a 76999) e Tocantins (77000 a 77999) são Norte apesar de
 * caírem no meio da faixa do Centro-Oeste, entao a tabela quebra ali de
 * proposito. Juntar as duas faixas cobraria frete de Centro-Oeste para o Norte.
 */
const BANDS: readonly Band[] = [
  { upTo: 39999, zone: 'sudeste' },
  { upTo: 65999, zone: 'nordeste' },
  { upTo: 69999, zone: 'norte' },
  { upTo: 76799, zone: 'centro-oeste' },
  { upTo: 77999, zone: 'norte' },
  { upTo: 79999, zone: 'centro-oeste' },
  { upTo: 99999, zone: 'sul' },
];

export const ZONE_LABEL: Record<Zone, string> = {
  sudeste: 'Sudeste',
  sul: 'Sul',
  'centro-oeste': 'Centro-Oeste',
  nordeste: 'Nordeste',
  norte: 'Norte',
};

export function digitsOf(cep: string): string {
  return cep.replace(/\D/g, '');
}

export function isValidCep(cep: string): boolean {
  return digitsOf(cep).length === 8;
}

export function formatCep(cep: string): string {
  const digits = digitsOf(cep).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function zoneOf(cep: string): Zone | null {
  if (!isValidCep(cep)) return null;

  const prefix = Number(digitsOf(cep).slice(0, 5));
  return BANDS.find((band) => prefix <= band.upTo)?.zone ?? null;
}

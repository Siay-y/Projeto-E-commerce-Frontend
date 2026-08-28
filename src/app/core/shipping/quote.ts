import { Packed } from '../catalog/product';
import { Zone, zoneOf } from './zones';

/** Divisor de peso cubado usado pelas transportadoras no Brasil. */
const CUBIC_DIVISOR = 6000;

/** Acima disto a peça sai da encomenda comum e precisa de transporte especial. */
const MAX_SIDE_CM = 100;

const EXPRESS_MULTIPLIER = 1.75;

interface Band {
  readonly base: number;
  readonly perKg: number;
  readonly days: number;
}

const TABLE: Record<Zone, Band> = {
  sudeste: { base: 18.9, perKg: 2.4, days: 4 },
  sul: { base: 22.9, perKg: 3.1, days: 6 },
  'centro-oeste': { base: 26.9, perKg: 3.8, days: 7 },
  nordeste: { base: 29.9, perKg: 4.4, days: 9 },
  norte: { base: 36.9, perKg: 5.6, days: 13 },
};

export type ServiceId = 'padrao' | 'expressa';

export interface Parcel {
  readonly packed: Packed;
  readonly quantity: number;
  /** Dias de produção antes de a peça existir. Zero em pronta entrega. */
  readonly readyInDays: number;
}

export interface Service {
  readonly id: ServiceId;
  readonly label: string;
  readonly price: number;
  readonly days: number;
}

export interface Shipment {
  readonly label: string;
  readonly days: number;
  readonly readyInDays: number;
}

export interface Quote {
  readonly zone: Zone;
  readonly billableKg: number;
  readonly services: readonly Service[];
  readonly shipments: readonly Shipment[];
}

export type QuoteFailure = 'cep-invalido' | 'sem-itens' | 'peca-grande';

export function cubicWeight({ length, width, height }: Packed): number {
  return (length * width * height) / CUBIC_DIVISOR;
}

export function isOversize({ length, width, height }: Packed): boolean {
  return Math.max(length, width, height) > MAX_SIDE_CM;
}

/**
 * As transportadoras cobram o maior entre peso real e peso cubado. Somamos os
 * dois lados antes de comparar, e nao peça a peça: é a caixa fechada que viaja,
 * entao comparar item a item cobraria cubagem de espaço que não existe.
 */
export function billableWeight(parcels: readonly Parcel[]): number {
  const real = parcels.reduce((sum, p) => sum + p.packed.weight * p.quantity, 0);
  const cubic = parcels.reduce((sum, p) => sum + cubicWeight(p.packed) * p.quantity, 0);

  return Math.round(Math.max(real, cubic) * 100) / 100;
}

function priceFor(band: Band, kg: number): number {
  return Math.round((band.base + band.perKg * kg) * 100) / 100;
}

export function quoteFor(
  cep: string,
  parcels: readonly Parcel[],
): Quote | { readonly error: QuoteFailure } {
  const zone = zoneOf(cep);
  if (!zone) return { error: 'cep-invalido' };
  if (parcels.length === 0) return { error: 'sem-itens' };
  if (parcels.some((parcel) => isOversize(parcel.packed))) {
    return { error: 'peca-grande' };
  }

  const band = TABLE[zone];
  const billableKg = billableWeight(parcels);
  const price = priceFor(band, billableKg);

  // Dois envios, um frete so: o cliente paga o transporte mais caro e a loja
  // absorve o segundo. E o custo de vender sob encomenda.
  const groups = splitByReadiness(parcels);
  const shipments = groups.map((group) => ({
    label: group.readyInDays === 0 ? 'Pronta entrega' : 'Sob encomenda',
    days: band.days,
    readyInDays: group.readyInDays,
  }));

  return {
    zone,
    billableKg,
    services: [
      { id: 'padrao', label: 'Padrão', price, days: band.days },
      {
        id: 'expressa',
        label: 'Expressa',
        price: Math.round(price * EXPRESS_MULTIPLIER * 100) / 100,
        days: Math.max(1, Math.ceil(band.days / 2)),
      },
    ],
    shipments,
  };
}

function splitByReadiness(
  parcels: readonly Parcel[],
): readonly { readonly readyInDays: number }[] {
  const ready = parcels.filter((parcel) => parcel.readyInDays === 0);
  const made = parcels.filter((parcel) => parcel.readyInDays > 0);

  const groups: { readonly readyInDays: number }[] = [];
  if (ready.length > 0) groups.push({ readyInDays: 0 });
  if (made.length > 0) {
    groups.push({
      readyInDays: Math.max(...made.map((parcel) => parcel.readyInDays)),
    });
  }

  return groups;
}

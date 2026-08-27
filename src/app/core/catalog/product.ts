import { AnimeRef } from './anime';
import { CategorySlug } from './category';

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly title: string;

  readonly anime: AnimeRef;
  readonly category: CategorySlug;

  readonly price: number;

  readonly compareAt?: number;

  readonly image?: string;

  readonly availability: Availability;

  readonly printed?: boolean;

  readonly critical?: boolean;

  readonly rating?: ProductRating;

  readonly summary?: string;

  readonly details?: readonly string[];

  readonly specs?: readonly ProductSpec[];

  readonly options?: ProductOptions;
}

export type Availability =
  | { readonly kind: 'stock'; readonly units: number }
  | { readonly kind: 'made-to-order'; readonly days: number };

export interface ProductRating {
  readonly average: number;
  readonly count: number;
}

export interface ProductSpec {
  readonly label: string;
  readonly value: string;
}

export type OptionAxis = 'size' | 'scale';

export interface ProductOption {
  readonly id: string;
  readonly label: string;
  readonly note?: string;
  readonly price?: number;
  readonly availability?: Availability;
}

export interface ProductOptions {
  readonly axis: OptionAxis;
  readonly values: readonly ProductOption[];
}

export const OPTION_AXIS: Record<OptionAxis, { legend: string; prompt: string }> = {
  size: { legend: 'Tamanho', prompt: 'Escolher tamanho' },
  scale: { legend: 'Tamanho da peça', prompt: 'Escolher tamanho' },
};

export function priceOf(product: Product, option?: ProductOption): number {
  return option?.price ?? product.price;
}

export function availabilityOf(product: Product, option?: ProductOption): Availability {
  return option?.availability ?? product.availability;
}

export function isSoldOut(availability: Availability): boolean {
  return availability.kind === 'stock' && availability.units <= 0;
}

export function firstAvailable(product: Product): ProductOption | undefined {
  const values = product.options?.values;
  if (!values || values.length === 0) return undefined;

  return values.find((v) => !isSoldOut(availabilityOf(product, v))) ?? values[0];
}

export function cardAvailability(product: Product): Availability {
  const values = product.options?.values;
  if (!values || values.length === 0) return product.availability;

  const live = values
    .map((v) => availabilityOf(product, v))
    .filter((availability) => !isSoldOut(availability));

  if (live.length === 0) return { kind: 'stock', units: 0 };

  const units = live.reduce((sum, a) => sum + (a.kind === 'stock' ? a.units : 0), 0);
  if (units > 0) return { kind: 'stock', units };

  const days = live.map((a) => (a.kind === 'made-to-order' ? a.days : 0));
  return { kind: 'made-to-order', days: Math.min(...days) };
}

function optionPrices(product: Product): readonly number[] {
  const values = product.options?.values ?? [];
  return values.map((v) => v.price ?? product.price);
}

export function displayPrice(product: Product): number {
  const prices = optionPrices(product);
  return prices.length > 0 ? Math.min(...prices) : product.price;
}

export function priceVaries(product: Product): boolean {
  const prices = optionPrices(product);
  return prices.length > 1 && Math.min(...prices) !== Math.max(...prices);
}

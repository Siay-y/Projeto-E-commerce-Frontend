import { MAX_PER_LINE } from '../../app/core/cart/cart-store';
import { PRODUCTS } from '../../app/core/catalog/catalog-data';
import { availabilityOf, packedOf } from '../../app/core/catalog/product';
import { Parcel } from '../../app/core/shipping/quote';

export const MAX_ITEMS = 40;

export interface QuoteItem {
  readonly id?: unknown;
  readonly optionId?: unknown;
  readonly quantity?: unknown;
}

export type ParcelsResult =
  | { readonly ok: true; readonly parcels: Parcel[] }
  | { readonly ok: false; readonly error: 'sem-itens' | 'item-desconhecido' };

export function parcelsFrom(items: readonly QuoteItem[]): ParcelsResult {
  if (items.length === 0 || items.length > MAX_ITEMS) {
    return { ok: false, error: 'sem-itens' };
  }

  const parcels: Parcel[] = [];

  for (const item of items) {
    const product = PRODUCTS.find((candidate) => candidate.id === item.id);
    if (!product) return { ok: false, error: 'item-desconhecido' };

    const option = product.options?.values.find((value) => value.id === item.optionId);
    const availability = availabilityOf(product, option);

    parcels.push({
      packed: packedOf(product, option),
      quantity: clamp(item.quantity),
      readyInDays: availability.kind === 'made-to-order' ? availability.days : 0,
    });
  }

  return { ok: true, parcels };
}

function clamp(quantity: unknown): number {
  return Math.min(MAX_PER_LINE, Math.max(1, Math.trunc(Number(quantity) || 1)));
}

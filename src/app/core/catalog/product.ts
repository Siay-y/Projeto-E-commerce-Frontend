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
}

export type Availability =
  | { readonly kind: 'stock'; readonly units: number }
  | { readonly kind: 'made-to-order'; readonly days: number };

export interface ProductRating {
  readonly average: number;
  readonly count: number;
}

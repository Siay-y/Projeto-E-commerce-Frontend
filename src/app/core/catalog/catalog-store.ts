import { Injectable, computed, signal } from '@angular/core';

import { Anime } from './anime';
import { ANIMES, PRODUCTS } from './catalog-data';
import { CategorySlug } from './category';
import { Product } from './product';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly products = signal<readonly Product[]>(PRODUCTS);
  private readonly catalogue = signal<readonly Anime[]>(ANIMES);

  readonly all = this.products.asReadonly();
  readonly animes = this.catalogue.asReadonly();

  readonly onSale = computed(() =>
    this.products().filter((p) => p.compareAt !== undefined && p.compareAt > p.price),
  );

  readonly critical = computed(() => this.products().filter((p) => p.critical === true));

  bySlug(slug: string): Product | undefined {
    return this.products().find((product) => product.slug === slug);
  }

  animeBySlug(slug: string): Anime | undefined {
    return this.catalogue().find((anime) => anime.slug === slug);
  }

  byAnime(slug: string): readonly Product[] {
    return this.products().filter((product) => product.anime.slug === slug);
  }

  byCategory(slug: CategorySlug): readonly Product[] {
    return this.products().filter((product) => product.category === slug);
  }

  countByAnime(slug: string): number {
    return this.byAnime(slug).length;
  }

  /**
   * As duas listas nunca se completam uma com a outra: cada prateleira do fim
   * da página tem um título que promete um recorte, e emprestar item de fora
   * faz o título mentir.
   */
  sameAnime(product: Product, limit: number): readonly Product[] {
    return this.byAnime(product.anime.slug)
      .filter((candidate) => candidate.id !== product.id)
      .slice(0, limit);
  }

  sameDepartment(product: Product, limit: number): readonly Product[] {
    return this.byCategory(product.category)
      .filter(
        (candidate) =>
          candidate.id !== product.id && candidate.anime.slug !== product.anime.slug,
      )
      .slice(0, limit);
  }
}

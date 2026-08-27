import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartStore, lineFor } from '../../core/cart/cart-store';
import { CatalogStore } from '../../core/catalog/catalog-store';
import { CATEGORIES } from '../../core/catalog/category';
import { flagsFor } from '../../core/catalog/flags';
import { Product } from '../../core/catalog/product';
import { RESPONSE_INIT, markNotFound } from '../../core/http/not-found';
import { ButtonLink } from '../../shared/ui/button/button-link';
import { IconD20 } from '../../shared/ui/icon-d20/icon-d20';
import { NotFound } from '../../shared/ui/not-found/not-found';
import { ProductBuy } from '../../shared/ui/product-buy/product-buy';
import { ProductFlags } from '../../shared/ui/product-flags/product-flags';
import { ProductShelf } from '../../shared/ui/product-shelf/product-shelf';

const RELATED = 8;

const SCORE = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

@Component({
  selector: 'app-product-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonLink,
    IconD20,
    NotFound,
    ProductBuy,
    ProductFlags,
    ProductShelf,
  ],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage {
  readonly slug = input.required<string>();

  private readonly catalog = inject(CatalogStore);
  private readonly cart = inject(CartStore);

  protected readonly product = computed(() => this.catalog.bySlug(this.slug()));

  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  constructor() {
    effect(() => {
      if (!this.product()) markNotFound(this.responseInit);
    });
  }

  protected readonly flags = computed(() => {
    const product = this.product();
    return product ? flagsFor(product) : [];
  });

  protected readonly score = computed(() => {
    const rating = this.product()?.rating;
    return rating ? SCORE.format(rating.average) : '';
  });

  protected readonly department = computed(() =>
    CATEGORIES.find((entry) => entry.slug === this.product()?.category),
  );

  protected readonly fromAnime = computed(() => {
    const product = this.product();
    return product ? this.catalog.sameAnime(product, RELATED) : [];
  });

  protected readonly fromDepartment = computed(() => {
    const product = this.product();
    return product ? this.catalog.sameDepartment(product, RELATED) : [];
  });

  protected addRelated(product: Product): void {
    this.cart.add(lineFor(product));
  }
}

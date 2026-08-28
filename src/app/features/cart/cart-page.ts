import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartStore, FREE_SHIPPING_FROM, lineFor } from '../../core/cart/cart-store';
import { CatalogStore } from '../../core/catalog/catalog-store';
import { Product } from '../../core/catalog/product';
import { formatBRL } from '../../core/format/money';
import { PATHS } from '../../core/routing/paths';
import { ShippingStore } from '../../core/shipping/shipping-store';
import { ButtonLink } from '../../shared/ui/button/button-link';
import { CriticalRoll } from '../../shared/ui/critical-roll/critical-roll';
import { Icon } from '../../shared/ui/icon/icon';
import { IconD20 } from '../../shared/ui/icon-d20/icon-d20';
import { ProductShelf } from '../../shared/ui/product-shelf/product-shelf';
import { ShippingCalc } from '../../shared/ui/shipping-calc/shipping-calc';
import { CartRow } from './cart-row';

const SUGGESTIONS = 8;

@Component({
  selector: 'app-cart-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonLink,
    CriticalRoll,
    Icon,
    IconD20,
    ProductShelf,
    ShippingCalc,
    CartRow,
  ],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  protected readonly PATHS = PATHS;
  protected readonly cart = inject(CartStore);
  private readonly shipping = inject(ShippingStore);
  private readonly catalog = inject(CatalogStore);

  protected readonly heading = computed(() => {
    const count = this.cart.count();
    if (count === 0) return 'Seu carrinho';
    return count === 1 ? '1 item no carrinho' : `${count} itens no carrinho`;
  });

  protected readonly missing = computed(() =>
    formatBRL(Math.max(0, FREE_SHIPPING_FROM - this.cart.subtotal())),
  );

  protected readonly shippingLabel = computed(() => {
    const price = this.shipping.price();
    if (price === null) return 'Informe o CEP';

    return price === 0 ? 'Grátis' : formatBRL(price);
  });

  protected readonly totalLabel = computed(() => formatBRL(this.shipping.total()));

  protected readonly barWidth = computed(
    () => `${Math.round(this.cart.shippingProgress() * 100)}%`,
  );

  // Sugestao vem dos animes que ja estao no carrinho: quem levou Frieren tende
  // a querer mais Frieren, e nao o que estiver em alta.
  protected readonly suggestions = computed(() => {
    const inCart = new Set(this.cart.items().map((line) => line.productId));
    if (inCart.size === 0) return [];

    const animes = new Set(
      this.cart
        .items()
        .map((line) => this.catalog.bySlug(line.slug)?.anime.slug)
        .filter((slug): slug is string => Boolean(slug)),
    );

    return this.catalog
      .all()
      .filter((product) => animes.has(product.anime.slug) && !inCart.has(product.id))
      .slice(0, SUGGESTIONS);
  });

  protected addSuggestion(product: Product): void {
    this.cart.add(lineFor(product));
  }
}

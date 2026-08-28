import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { CatalogStore } from '../../core/catalog/catalog-store';
import { CartStore, lineFor } from '../../core/cart/cart-store';
import { CATEGORIES } from '../../core/catalog/category';
import { Product } from '../../core/catalog/product';
import { PATHS } from '../../core/routing/paths';
import { Button } from '../../shared/ui/button/button';
import { ProductCard } from '../../shared/ui/product-card/product-card';
import { ProductShelf } from '../../shared/ui/product-shelf/product-shelf';

@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, ProductCard, ProductShelf],
  styleUrl: './placeholder-page.scss',
  template: `
    <div class="ph__band">
      <header class="ph__head">
        <div>
          <p class="ph__kicker">Módulo em construção</p>
          <h1 class="ph__title">{{ title() }}</h1>
        </div>

        <div class="ph__cta">
          <button appButton variant="secondary">Ver novidades</button>
          <button appButton variant="accent">Montar Loot Box</button>
        </div>
      </header>
    </div>

    <section class="ph">
      <!-- A vitrine so faz sentido na home: num recorte ela repetiria, logo
           acima da grade, as mesmas pecas que a grade ja mostra. -->
      @if (!sliced()) {
        <app-product-shelf
          class="ph__shelf"
          kicker="Chegou agora"
          heading="Em alta na guilda"
          [seeAll]="PATHS.animes"
          [products]="products()"
          (add)="addToCart($event)"
        />
      }

      <h2 class="ph__section">{{ sectionTitle() }}</h2>

      @if (products().length > 0) {
        <div class="ph__grid">
          @for (product of products(); track product.id) {
            <app-product-card [product]="product" (add)="addToCart($event)" />
          }
        </div>
      } @else {
        <p class="ph__empty">Nada por aqui ainda.</p>
      }
    </section>
  `,
})
export class PlaceholderPage {
  protected readonly PATHS = PATHS;

  readonly heading = input.required<string>();


  readonly anime = input<string | undefined>(undefined);

  readonly category = input<string | undefined>(undefined);

  protected readonly catalog = inject(CatalogStore);
  private readonly cart = inject(CartStore);

  private readonly department = computed(() =>
    CATEGORIES.find((entry) => entry.slug === this.category()),
  );

  protected readonly sliced = computed(() =>
    Boolean(this.anime() || this.department()),
  );

  protected readonly products = computed<readonly Product[]>(() => {
    const department = this.department();
    if (department) return this.catalog.byCategory(department.slug);

    const anime = this.anime();
    if (anime) return this.catalog.byAnime(anime);

    return this.catalog.all();
  });

  protected readonly title = computed(() => {
    const department = this.department();
    if (department) return department.label;

    const anime = this.anime();
    if (!anime) return this.heading();

    return this.catalog.animeBySlug(anime)?.name ?? this.heading();
  });

  protected readonly sectionTitle = computed(() =>
    this.sliced() ? `${this.products().length} produtos` : 'Todos os produtos',
  );

  protected addToCart(product: Product): void {
    this.cart.add(lineFor(product));
  }
}

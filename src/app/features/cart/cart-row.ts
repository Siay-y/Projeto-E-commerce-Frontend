import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartLine, CartStore, MAX_PER_LINE } from '../../core/cart/cart-store';
import { CatalogStore } from '../../core/catalog/catalog-store';
import { availabilityOf } from '../../core/catalog/product';
import { formatBRL } from '../../core/format/money';
import { Icon } from '../../shared/ui/icon/icon';
import { IconD20 } from '../../shared/ui/icon-d20/icon-d20';

@Component({
  selector: 'app-cart-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, IconD20],
  styleUrl: './cart-row.scss',
  template: `
    <div class="cr__frame">
      @if (product()?.image; as image) {
        <img class="cr__img" [src]="image" [attr.alt]="line().title" loading="lazy" />
      } @else {
        <span class="cr__mark" aria-hidden="true">
          <app-icon-d20 variant="solid" [size]="40" label="" />
        </span>
      }
    </div>

    <div class="cr__body">
      <a class="cr__title" [routerLink]="['/produto', line().slug]">{{ line().title }}</a>

      @if (line().variant; as variant) {
        <p class="cr__variant">{{ variant }}</p>
      }

      @if (line().quantity > 1) {
        <p class="cr__unit">{{ unitLabel() }} cada</p>
      }
    </div>

    <!-- Vira display:contents no desktop, e assim o seletor, o preco e o
         remover caem cada um numa coluna do subgrid da lista, em vez de
         formarem um bloco de largura propria que anda a cada linha. -->
    <div class="cr__tools">
      <label class="cr__qty">
        <span class="sr-only">Quantidade de {{ line().title }}</span>
        <select
          class="cr__select"
          [value]="line().quantity"
          (change)="setQuantity($event)"
        >
          @for (amount of amounts(); track amount) {
            <option [value]="amount">{{ amount }}</option>
          }
        </select>
      </label>

      <p class="cr__total">{{ totalLabel() }}</p>

      <button
        class="cr__remove"
        type="button"
        [attr.aria-label]="'Remover ' + line().title + ' do carrinho'"
        (click)="cart.remove(line().id)"
      >
        <app-icon name="trash" [size]="17" />
        <span class="cr__remove-text">Remover</span>
      </button>
    </div>
  `,
})
export class CartRow {
  readonly line = input.required<CartLine>();

  protected readonly cart = inject(CartStore);
  private readonly catalog = inject(CatalogStore);

  protected readonly product = computed(() => this.catalog.bySlug(this.line().slug));

  // O teto vem do estoque daquele tamanho, e nao do produto: sem isso o
  // carrinho aceita 10 camisas G quando so existem 2.
  protected readonly amounts = computed<readonly number[]>(() => {
    const product = this.product();
    const option = product?.options?.values.find(
      (value) => value.id === this.line().optionId,
    );

    const availability = product ? availabilityOf(product, option) : null;
    const ceiling =
      availability?.kind === 'stock'
        ? Math.min(MAX_PER_LINE, availability.units)
        : MAX_PER_LINE;

    return Array.from(
      { length: Math.max(ceiling, this.line().quantity) },
      (_, i) => i + 1,
    );
  });

  protected readonly unitLabel = computed(() => formatBRL(this.line().unitPrice));

  protected readonly totalLabel = computed(() =>
    formatBRL(this.line().unitPrice * this.line().quantity),
  );

  protected setQuantity(event: Event): void {
    this.cart.setQuantity(this.line().id, Number((event.target as HTMLSelectElement).value));
  }
}

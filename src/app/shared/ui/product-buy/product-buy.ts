import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';

import { CartStore, FREE_SHIPPING_FROM, lineFor } from '../../../core/cart/cart-store';
import {
  OPTION_AXIS,
  Product,
  ProductOption,
  availabilityOf,
  firstAvailable,
  isSoldOut,
  priceOf,
  priceVaries,
} from '../../../core/catalog/product';
import { formatBRL, installmentsFor } from '../../../core/format/money';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

const LOW_STOCK = 3;

const MAX_QUANTITY = 10;

interface Note {
  readonly tone: 'urgent' | 'info' | 'out' | 'ready';
  readonly text: string;
}

interface Choice {
  readonly option: ProductOption;
  readonly out: boolean;
  readonly price: string | null;
}

@Component({
  selector: 'app-product-buy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  templateUrl: './product-buy.html',
  styleUrl: './product-buy.scss',
})
export class ProductBuy {
  readonly product = input.required<Product>();

  private readonly cart = inject(CartStore);

  protected readonly chosenId = linkedSignal({
    source: this.product,
    computation: (product) => firstAvailable(product)?.id ?? null,
  });

  private readonly sku = computed(() => `${this.product().slug}:${this.chosenId() ?? ''}`);

  protected readonly quantity = linkedSignal({
    source: this.sku,
    computation: () => 1,
  });

  protected readonly option = computed(() =>
    this.product().options?.values.find((value) => value.id === this.chosenId()),
  );

  protected readonly axis = computed(() => {
    const options = this.product().options;
    return options ? OPTION_AXIS[options.axis] : null;
  });

  protected readonly choices = computed<readonly Choice[]>(() => {
    const product = this.product();
    if (!product.options) return [];

    const varies = priceVaries(product);

    return product.options.values.map((option) => ({
      option,
      out: isSoldOut(availabilityOf(product, option)),
      price: varies ? formatBRL(priceOf(product, option)) : null,
    }));
  });

  private readonly availability = computed(() =>
    availabilityOf(this.product(), this.option()),
  );

  protected readonly soldOut = computed(() => isSoldOut(this.availability()));

  protected readonly price = computed(() => priceOf(this.product(), this.option()));

  protected readonly priceLabel = computed(() => formatBRL(this.price()));

  protected readonly wasLabel = computed(() => {
    const compareAt = this.product().compareAt;
    return compareAt !== undefined && compareAt > this.price() ? formatBRL(compareAt) : null;
  });

  protected readonly installment = computed(() => {
    const parcel = installmentsFor(this.price());
    return parcel && { count: parcel.count, value: formatBRL(parcel.value) };
  });

  protected readonly note = computed<Note>(() => {
    const availability = this.availability();

    if (availability.kind === 'made-to-order') {
      return {
        tone: 'info',
        text: `Sob encomenda, sai da oficina em até ${availability.days} dias`,
      };
    }

    const { units } = availability;
    if (units <= 0) {
      return {
        tone: 'out',
        text: this.axis() ? 'Esgotado neste tamanho' : 'Esgotado no momento',
      };
    }

    if (units <= LOW_STOCK) {
      return {
        tone: 'urgent',
        text: units === 1 ? 'Última unidade' : `Últimas ${units} unidades`,
      };
    }

    return { tone: 'ready', text: 'Pronta entrega' };
  });

  protected readonly quantities = computed<readonly number[]>(() => {
    const availability = this.availability();

    const ceiling =
      availability.kind === 'stock'
        ? Math.min(MAX_QUANTITY, availability.units)
        : MAX_QUANTITY;

    return Array.from({ length: Math.max(ceiling, 1) }, (_, i) => i + 1);
  });

  protected readonly inCart = computed(() =>
    this.cart.quantityOf(lineFor(this.product(), this.option()).id),
  );

  protected readonly shipping = computed(() =>
    this.price() >= FREE_SHIPPING_FROM
      ? 'Este item sozinho já garante frete grátis'
      : `Frete grátis em pedidos acima de ${formatBRL(FREE_SHIPPING_FROM)}`,
  );

  protected setQuantity(event: Event): void {
    this.quantity.set(Number((event.target as HTMLSelectElement).value));
  }

  protected addToCart(): void {
    if (this.soldOut()) return;

    this.cart.add(lineFor(this.product(), this.option()), this.quantity());
  }
}

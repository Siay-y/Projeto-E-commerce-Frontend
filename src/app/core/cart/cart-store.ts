import { Injectable, computed, signal } from '@angular/core';

import { formatBRL } from '../format/money';

export interface CartLine {
  readonly id: string;
  readonly title: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

const FREE_SHIPPING_FROM = 199;

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly lines = signal<readonly CartLine[]>([
    { id: 'dados-obsidiana', title: 'Set de dados Obsidiana', unitPrice: 149.9, quantity: 1 },
    { id: 'caneca-nevermore', title: 'Caneca térmica Nevermore', unitPrice: 99.9, quantity: 1 },
  ]);

  readonly items = this.lines.asReadonly();

  readonly count = computed(() =>
    this.lines().reduce((total, line) => total + line.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.lines().reduce((total, line) => total + line.unitPrice * line.quantity, 0),
  );

  readonly subtotalLabel = computed(() => formatBRL(this.subtotal()));

  readonly label = computed(() => {
    const count = this.count();
    if (count === 0) return 'Carrinho vazio';
    const noun = count === 1 ? 'item' : 'itens';
    return `Carrinho, ${count} ${noun}, subtotal ${this.subtotalLabel()}`;
  });

  readonly shippingHint = computed(() => {
    const missing = FREE_SHIPPING_FROM - this.subtotal();
    return missing > 0
      ? `Faltam ${formatBRL(missing)} para o frete grátis`
      : 'Frete grátis liberado neste pedido';
  });

  readonly hasFreeShipping = computed(() => this.subtotal() >= FREE_SHIPPING_FROM);

  add(item: Omit<CartLine, 'quantity'>, quantity = 1): void {
    if (quantity <= 0) return;

    this.lines.update((lines) => {
      const known = lines.some((line) => line.id === item.id);
      if (!known) return [...lines, { ...item, quantity }];

      return lines.map((line) =>
        line.id === item.id ? { ...line, quantity: line.quantity + quantity } : line,
      );
    });
  }
}

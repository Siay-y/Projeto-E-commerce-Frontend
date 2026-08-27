import { Injectable, computed, signal } from '@angular/core';

export interface CartLine {
  readonly id: string;
  readonly title: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

const FREE_SHIPPING_FROM = 199;

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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

  readonly subtotalLabel = computed(() => BRL.format(this.subtotal()));

  readonly label = computed(() => {
    const count = this.count();
    if (count === 0) return 'Carrinho vazio';
    const noun = count === 1 ? 'item' : 'itens';
    return `Carrinho, ${count} ${noun}, subtotal ${this.subtotalLabel()}`;
  });

  readonly shippingHint = computed(() => {
    const missing = FREE_SHIPPING_FROM - this.subtotal();
    return missing > 0
      ? `Faltam ${BRL.format(missing)} para o frete grátis`
      : 'Frete grátis liberado neste pedido';
  });

  readonly hasFreeShipping = computed(() => this.subtotal() >= FREE_SHIPPING_FROM);
}

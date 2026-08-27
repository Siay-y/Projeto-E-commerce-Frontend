import { Injectable, computed, signal } from '@angular/core';

import { Product, ProductOption, priceOf } from '../catalog/product';
import { formatBRL } from '../format/money';

export interface CartLine {
  // Camisa P e camisa M sao linhas distintas, entao a chave e o par
  // produto + opcao, e nao o id do produto.
  readonly id: string;
  readonly productId: string;
  readonly slug: string;
  readonly optionId?: string;
  readonly title: string;
  readonly variant?: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

export function lineFor(
  product: Product,
  option?: ProductOption,
): Omit<CartLine, 'quantity'> {
  return {
    id: option ? `${product.id}:${option.id}` : product.id,
    productId: product.id,
    slug: product.slug,
    optionId: option?.id,
    title: product.title,
    variant: option?.label,
    unitPrice: priceOf(product, option),
  };
}

export const FREE_SHIPPING_FROM = 199;

export const MAX_PER_LINE = 10;

interface Undo {
  readonly lines: readonly CartLine[];
  readonly label: string;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly lines = signal<readonly CartLine[]>([]);

  private readonly undoable = signal<Undo | null>(null);

  readonly items = this.lines.asReadonly();

  readonly count = computed(() =>
    this.lines().reduce((total, line) => total + line.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.lines().reduce((total, line) => total + line.unitPrice * line.quantity, 0),
  );

  readonly subtotalLabel = computed(() => formatBRL(this.subtotal()));

  readonly empty = computed(() => this.lines().length === 0);

  readonly label = computed(() => {
    const count = this.count();
    if (count === 0) return 'Carrinho vazio';
    const noun = count === 1 ? 'item' : 'itens';
    return `Carrinho, ${count} ${noun}, subtotal ${this.subtotalLabel()}`;
  });

  readonly shippingHint = computed(() => {
    if (this.count() === 0) {
      return `Frete grátis acima de ${formatBRL(FREE_SHIPPING_FROM)}`;
    }

    const missing = FREE_SHIPPING_FROM - this.subtotal();
    return missing > 0
      ? `Faltam ${formatBRL(missing)} para o frete grátis`
      : 'Frete grátis liberado';
  });

  readonly hasFreeShipping = computed(() => this.subtotal() >= FREE_SHIPPING_FROM);

  readonly shippingProgress = computed(() =>
    Math.min(1, this.subtotal() / FREE_SHIPPING_FROM),
  );

  /** Texto do aviso de desfazer, ou `null` quando não há o que desfazer. */
  readonly undoLabel = computed(() => this.undoable()?.label ?? null);

  quantityOf(id: string): number {
    return this.lines().find((line) => line.id === id)?.quantity ?? 0;
  }

  add(item: Omit<CartLine, 'quantity'>, quantity = 1): void {
    if (quantity <= 0) return;
    this.undoable.set(null);

    this.lines.update((lines) => {
      const known = lines.some((line) => line.id === item.id);
      if (!known) return [...lines, { ...item, quantity }];

      return lines.map((line) =>
        line.id === item.id
          ? { ...line, quantity: Math.min(MAX_PER_LINE, line.quantity + quantity) }
          : line,
      );
    });
  }

  setQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.remove(id);
      return;
    }

    this.undoable.set(null);
    this.lines.update((lines) =>
      lines.map((line) =>
        line.id === id ? { ...line, quantity: Math.min(MAX_PER_LINE, quantity) } : line,
      ),
    );
  }

  remove(id: string): void {
    const before = this.lines();
    const line = before.find((candidate) => candidate.id === id);
    if (!line) return;

    this.undoable.set({ lines: before, label: `${line.title} foi removido` });
    this.lines.set(before.filter((candidate) => candidate.id !== id));
  }

  clear(): void {
    if (this.lines().length === 0) return;

    this.undoable.set({ lines: this.lines(), label: 'Carrinho esvaziado' });
    this.lines.set([]);
  }

  undo(): void {
    const memory = this.undoable();
    if (!memory) return;

    this.lines.set(memory.lines);
    this.undoable.set(null);
  }

  dismissUndo(): void {
    this.undoable.set(null);
  }
}

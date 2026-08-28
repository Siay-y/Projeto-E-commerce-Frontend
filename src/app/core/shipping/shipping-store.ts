import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CartStore } from '../cart/cart-store';
import { Quote, QuoteFailure, ServiceId } from './quote';
import { digitsOf, isValidCep } from './zones';

const ENDPOINT = '/api/frete';

const CEP_KEY = 'ac-cep';

const MESSAGES: Record<QuoteFailure | 'rede', string> = {
  'cep-invalido': 'CEP inválido. São oito dígitos.',
  'sem-itens': 'Adicione uma peça antes de calcular.',
  'peca-grande': 'Essa peça precisa de transporte especial. Fale com a gente.',
  rede: 'Não deu para calcular agora. Tente de novo em instantes.',
};

@Injectable({ providedIn: 'root' })
export class ShippingStore {
  private readonly http = inject(HttpClient);
  private readonly cart = inject(CartStore);

  private readonly quoted = signal<Quote | null>(null);
  private readonly busy = signal(false);
  private readonly problem = signal<string | null>(null);

  readonly cep = signal('');
  readonly chosen = signal<ServiceId>('padrao');

  readonly quote = this.quoted.asReadonly();
  readonly calculating = this.busy.asReadonly();
  readonly error = this.problem.asReadonly();

  readonly service = computed(
    () => this.quoted()?.services.find((s) => s.id === this.chosen()) ?? null,
  );

  readonly price = computed(() => {
    const service = this.service();
    if (!service) return null;

    return this.cart.hasFreeShipping() && service.id === 'padrao' ? 0 : service.price;
  });

  readonly total = computed(() => this.cart.subtotal() + (this.price() ?? 0));

  restore(): void {
    try {
      const saved = localStorage.getItem(CEP_KEY);
      if (saved && isValidCep(saved)) {
        this.cep.set(saved);
        void this.calculate();
      }
    } catch {}
  }

  async calculate(): Promise<void> {
    const cep = digitsOf(this.cep());

    if (!isValidCep(cep)) {
      this.problem.set(MESSAGES['cep-invalido']);
      this.quoted.set(null);
      return;
    }

    if (this.cart.empty()) {
      this.problem.set(MESSAGES['sem-itens']);
      return;
    }

    this.busy.set(true);
    this.problem.set(null);

    try {
      const answer = await firstValueFrom(
        this.http.post<Quote>(ENDPOINT, {
          cep,
          items: this.cart.items().map((line) => ({
            id: line.productId,
            optionId: line.optionId,
            quantity: line.quantity,
          })),
        }),
      );

      this.quoted.set(answer);
      this.remember(cep);
    } catch (failure: unknown) {
      const code = (failure as { error?: { error?: QuoteFailure } })?.error?.error;
      this.problem.set(code ? MESSAGES[code] : MESSAGES.rede);
      this.quoted.set(null);
    } finally {
      this.busy.set(false);
    }
  }

  clear(): void {
    this.quoted.set(null);
    this.problem.set(null);
  }

  private remember(cep: string): void {
    try {
      localStorage.setItem(CEP_KEY, cep);
    } catch {}
  }
}

import { TestBed } from '@angular/core/testing';

import { CartStore } from './cart-store';

describe('CartStore', () => {
  let cart: CartStore;

  beforeEach(() => {
    cart = TestBed.inject(CartStore);
  });

  it('começa vazio', () => {
    expect(cart.count()).toBe(0);
    expect(cart.label()).toBe('Carrinho vazio');
  });

  it('soma as quantidades das linhas', () => {
    cart.add({ id: 'a', title: 'Camisa', unitPrice: 99.9 });
    cart.add({ id: 'b', title: 'Chaveiro', unitPrice: 24.9 }, 2);

    expect(cart.count()).toBe(3);
  });

  it('formata o subtotal em real brasileiro', () => {
    cart.add({ id: 'a', title: 'Camisa', unitPrice: 149.9 });
    cart.add({ id: 'b', title: 'Caneca', unitPrice: 99.9 });

    expect(cart.subtotal()).toBeCloseTo(249.8, 2);
    expect(cart.subtotalLabel().replace(/\s/g, ' ')).toBe('R$ 249,80');
  });

  it('anuncia a regra do frete quando não há itens', () => {
    expect(cart.hasFreeShipping()).toBe(false);
    expect(cart.shippingHint()).toContain('acima de');
  });

  it('mostra quanto falta para o frete grátis', () => {
    cart.add({ id: 'a', title: 'Camisa', unitPrice: 149.9 });

    expect(cart.hasFreeShipping()).toBe(false);
    expect(cart.shippingHint().replace(/\s/g, ' ')).toBe(
      'Faltam R$ 49,10 para o frete grátis',
    );
  });

  it('libera o frete grátis a partir do piso', () => {
    cart.add({ id: 'a', title: 'Réplica', unitPrice: 199 });

    expect(cart.hasFreeShipping()).toBe(true);
    expect(cart.shippingHint()).toContain('liberado');
  });

  it('descreve o carrinho para o leitor de tela', () => {
    cart.add({ id: 'a', title: 'Camisa', unitPrice: 99.9 }, 2);

    expect(cart.label()).toContain('2 itens');
  });
});

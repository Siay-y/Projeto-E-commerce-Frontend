import { TestBed } from '@angular/core/testing';

import { CartStore } from './cart-store';

describe('CartStore', () => {
  let cart: CartStore;

  beforeEach(() => {
    cart = TestBed.inject(CartStore);
  });

  it('soma as quantidades das linhas', () => {
    expect(cart.count()).toBe(2);
  });

  it('formata o subtotal em real brasileiro', () => {
    expect(cart.subtotal()).toBeCloseTo(249.8, 2);
    expect(cart.subtotalLabel().replace(/ /g, ' ')).toBe('R$ 249,80');
  });

  it('libera o frete grátis acima do piso', () => {
    expect(cart.hasFreeShipping()).toBe(true);
    expect(cart.shippingHint()).toContain('liberado');
  });

  it('descreve o carrinho para o leitor de tela', () => {
    expect(cart.label()).toContain('2 itens');
  });
});

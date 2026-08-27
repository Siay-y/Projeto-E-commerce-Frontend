import { TestBed } from '@angular/core/testing';

import { CartStore, lineFor } from './cart-store';
import { CatalogStore } from '../catalog/catalog-store';

const plain = (value: string) => value.replace(/\s/g, ' ');

describe('CartStore', () => {
  let cart: CartStore;
  let catalog: CatalogStore;

  const product = (slug: string) => {
    const found = catalog.bySlug(slug);
    if (!found) throw new Error(`Produto ausente no catalogo de teste: ${slug}`);
    return found;
  };

  beforeEach(() => {
    cart = TestBed.inject(CartStore);
    catalog = TestBed.inject(CatalogStore);
  });

  it('começa vazio', () => {
    expect(cart.count()).toBe(0);
    expect(cart.label()).toBe('Carrinho vazio');
  });

  it('soma as quantidades das linhas', () => {
    cart.add(lineFor(product('colar-pochita')));
    cart.add(lineFor(product('broche-fern')), 2);

    expect(cart.count()).toBe(3);
  });

  it('formata o subtotal em real brasileiro', () => {
    cart.add(lineFor(product('colar-pochita')));
    cart.add(lineFor(product('suporte-fone-eva')));

    expect(cart.subtotal()).toBeCloseTo(229.8, 2);
    expect(plain(cart.subtotalLabel())).toBe('R$ 229,80');
  });

  it('separa a mesma camisa em linhas por tamanho', () => {
    const camisa = product('camiseta-frieren-jornada');
    const values = camisa.options?.values ?? [];

    cart.add(lineFor(camisa, values[1]));
    cart.add(lineFor(camisa, values[2]));

    expect(cart.items().length).toBe(2);
    expect(cart.items().map((line) => line.variant)).toEqual(['P', 'M']);
  });

  it('junta a mesma camisa no mesmo tamanho', () => {
    const camisa = product('camiseta-frieren-jornada');
    const P = camisa.options?.values[1];

    cart.add(lineFor(camisa, P));
    cart.add(lineFor(camisa, P), 2);

    expect(cart.items().length).toBe(1);
    expect(cart.count()).toBe(3);
  });

  it('cobra o preço da opção escolhida, não o do produto', () => {
    const espada = product('dragon-slayer-guts');
    const grande = espada.options?.values.find((value) => value.id === '145cm');

    cart.add(lineFor(espada, grande));

    expect(cart.subtotal()).toBe(1290);
  });

  it('anuncia a regra do frete quando não há itens', () => {
    expect(cart.hasFreeShipping()).toBe(false);
    expect(cart.shippingHint()).toContain('acima de');
  });

  it('mostra quanto falta para o frete grátis', () => {
    cart.add(lineFor(product('colar-pochita')));

    expect(cart.hasFreeShipping()).toBe(false);
    expect(plain(cart.shippingHint())).toBe('Faltam R$ 49,10 para o frete grátis');
  });

  it('libera o frete grátis a partir do piso', () => {
    cart.add(lineFor(product('figure-anya')));

    expect(cart.hasFreeShipping()).toBe(true);
    expect(cart.shippingHint()).toContain('liberado');
  });

  it('descreve o carrinho para o leitor de tela', () => {
    cart.add(lineFor(product('broche-fern')), 2);

    expect(cart.label()).toContain('2 itens');
  });
});

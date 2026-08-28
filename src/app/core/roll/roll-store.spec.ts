import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CartStore, lineFor } from '../cart/cart-store';
import { CatalogStore } from '../catalog/catalog-store';
import { RollStore } from './roll-store';

describe('RollStore', () => {
  let roll: RollStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    roll = TestBed.inject(RollStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('começa sem resultado', () => {
    expect(roll.result()).toBeNull();
    expect(roll.rolling()).toBe(false);
  });

  it('lê a rolagem que já existia na sessão', async () => {
    const pending = roll.load();
    http.expectOne({ method: 'GET', url: '/api/rolagem' }).flush({ value: 14 });
    await pending;

    expect(roll.result()?.value).toBe(14);
    expect(roll.reward()?.tier).toBe('shipping');
  });

  it('não pede de novo depois de já ter rolado', async () => {
    const pending = roll.roll();
    http.expectOne({ method: 'POST', url: '/api/rolagem' }).flush({ value: 20 });
    await pending;

    await roll.roll();

    expect(roll.result()?.value).toBe(20);
  });

  it('marca erro sem travar o botão quando a rede falha', async () => {
    const pending = roll.roll();
    http
      .expectOne({ method: 'POST', url: '/api/rolagem' })
      .error(new ProgressEvent('erro'));
    await pending;

    expect(roll.error()).toBe(true);
    expect(roll.rolling()).toBe(false);
    expect(roll.result()).toBeNull();
  });

  it('derruba o piso do frete grátis no carrinho', async () => {
    const cart = TestBed.inject(CartStore);
    const catalog = TestBed.inject(CatalogStore);
    cart.add(lineFor(catalog.bySlug('colar-pochita')!));

    expect(cart.hasFreeShipping()).toBe(false);

    const pending = roll.load();
    http.expectOne({ method: 'GET', url: '/api/rolagem' }).flush({ value: 3 });
    await pending;

    expect(cart.shippingFrom()).toBe(149);
    expect(cart.hasFreeShipping()).toBe(true);
  });

  it('zera o frete quando a rolagem dá dez ou mais', async () => {
    const cart = TestBed.inject(CartStore);

    const pending = roll.load();
    http.expectOne({ method: 'GET', url: '/api/rolagem' }).flush({ value: 10 });
    await pending;

    expect(cart.shippingFrom()).toBe(0);
    expect(cart.hasFreeShipping()).toBe(true);
    expect(cart.shippingHint()).toBe('Frete grátis liberado');
  });
});

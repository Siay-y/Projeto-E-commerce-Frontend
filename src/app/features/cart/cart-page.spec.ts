import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CartStore, lineFor } from '../../core/cart/cart-store';
import { CatalogStore } from '../../core/catalog/catalog-store';
import { CartPage } from './cart-page';

describe('CartPage', () => {
  let cart: CartStore;
  let catalog: CatalogStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', children: [] }]),
      ],
    });

    cart = TestBed.inject(CartStore);
    catalog = TestBed.inject(CatalogStore);
  });

  const product = (slug: string) => {
    const found = catalog.bySlug(slug);
    if (!found) throw new Error(`Produto ausente no catalogo de teste: ${slug}`);
    return found;
  };

  async function open() {
    const fixture: ComponentFixture<CartPage> = TestBed.createComponent(CartPage);
    await fixture.whenStable();
    return fixture;
  }

  const host = (fixture: ComponentFixture<CartPage>) => fixture.nativeElement as HTMLElement;

  const rows = (fixture: ComponentFixture<CartPage>) => [
    ...host(fixture).querySelectorAll('app-cart-row'),
  ];

  it('mostra o estado vazio quando não há nada', async () => {
    const fixture = await open();

    expect(host(fixture).querySelector('.ct__void')).not.toBeNull();
    expect(rows(fixture)).toHaveLength(0);
  });

  it('lista uma linha por par produto e tamanho', async () => {
    const camisa = product('camiseta-frieren-jornada');
    const values = camisa.options?.values ?? [];

    cart.add(lineFor(camisa, values[1]));
    cart.add(lineFor(camisa, values[2]));

    const fixture = await open();

    expect(rows(fixture)).toHaveLength(2);
    expect(host(fixture).querySelector('.ct__title')?.textContent).toContain('2 itens');
  });

  it('devolve a peça na mesma posição ao desfazer', async () => {
    cart.add(lineFor(product('colar-pochita')));
    cart.add(lineFor(product('broche-fern')));
    cart.add(lineFor(product('figure-anya')));

    const fixture = await open();

    host(fixture).querySelectorAll<HTMLButtonElement>('.cr__remove')[1].click();
    await fixture.whenStable();

    expect(cart.items().map((line) => line.slug)).toEqual([
      'colar-pochita',
      'figure-anya',
    ]);
    expect(host(fixture).querySelector('.ct__undo')?.textContent).toContain(
      'Broche esmaltado Fern foi removido',
    );

    host(fixture).querySelector<HTMLButtonElement>('.ct__undo-do')!.click();
    await fixture.whenStable();

    expect(cart.items().map((line) => line.slug)).toEqual([
      'colar-pochita',
      'broche-fern',
      'figure-anya',
    ]);
    expect(host(fixture).querySelector('.ct__undo')).toBeNull();
  });

  it('desfaz também o esvaziar', async () => {
    cart.add(lineFor(product('colar-pochita')));
    const fixture = await open();

    host(fixture).querySelector<HTMLButtonElement>('.ct__clear')!.click();
    await fixture.whenStable();
    expect(cart.empty()).toBe(true);

    host(fixture).querySelector<HTMLButtonElement>('.ct__undo-do')!.click();
    await fixture.whenStable();
    expect(cart.items()).toHaveLength(1);
  });

  it('não deixa pedir mais unidades do que existem naquele tamanho', async () => {
    const chapeu = product('chapeu-luffy');
    const sessenta = chapeu.options?.values.find((value) => value.id === '60');

    cart.add(lineFor(chapeu, sessenta));
    const fixture = await open();

    const options = [...host(fixture).querySelectorAll('.cr__select option')];
    expect(options.map((option) => option.textContent)).toEqual(['1']);
  });

  it('sugere só peças dos animes que já estão no carrinho', async () => {
    cart.add(lineFor(product('colar-pochita')));

    const fixture = await open();
    const shelf = host(fixture).querySelector('app-product-shelf');
    const animes = [...(shelf?.querySelectorAll('.pc__anime') ?? [])].map((el) =>
      el.textContent?.trim(),
    );

    expect(animes.length).toBeGreaterThan(0);
    expect(new Set(animes)).toEqual(new Set(['Chainsaw Man']));
  });

  it('não sugere o que já está no carrinho', async () => {
    cart.add(lineFor(product('colar-pochita')));
    cart.add(lineFor(product('peruca-makima')));

    const fixture = await open();

    expect(host(fixture).querySelector('app-product-shelf')).toBeNull();
  });
});

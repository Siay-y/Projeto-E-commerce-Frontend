import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CartStore } from '../../core/cart/cart-store';
import { ProductPage } from './product-page';

describe('ProductPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
  });

  async function open(slug: string) {
    const fixture: ComponentFixture<ProductPage> = TestBed.createComponent(ProductPage);
    fixture.componentRef.setInput('slug', slug);
    await fixture.whenStable();
    return fixture;
  }

  const host = (fixture: ComponentFixture<ProductPage>) =>
    fixture.nativeElement as HTMLElement;

  const swatches = (fixture: ComponentFixture<ProductPage>) => [
    ...host(fixture).querySelectorAll<HTMLInputElement>('.by__radio'),
  ];

  const addButton = (fixture: ComponentFixture<ProductPage>) =>
    host(fixture).querySelector<HTMLButtonElement>('.by__add')!;

  it('mostra o produto pedido pela rota', async () => {
    const fixture = await open('colar-pochita');

    expect(host(fixture).querySelector('.pd__title')?.textContent?.trim()).toBe(
      'Colar Pochita em prata 925',
    );
  });

  it('avisa quando o slug não existe, em vez de mostrar página vazia', async () => {
    const fixture = await open('produto-que-nunca-existiu');

    expect(host(fixture).querySelector('app-not-found')).not.toBeNull();
    expect(host(fixture).querySelector('.pd__title')).toBeNull();
  });

  it('não pede escolha em produto sem tamanho', async () => {
    const fixture = await open('colar-pochita');

    expect(swatches(fixture)).toHaveLength(0);
    expect(addButton(fixture).disabled).toBe(false);
  });

  it('já vem com um tamanho disponível marcado', async () => {
    const fixture = await open('camiseta-frieren-jornada');
    const marked = swatches(fixture).filter((input) => input.checked);

    expect(marked).toHaveLength(1);
    expect(marked[0].disabled).toBe(false);
  });

  it('desabilita o tamanho esgotado sem esgotar o produto', async () => {
    const fixture = await open('camiseta-frieren-jornada');
    const gg = swatches(fixture).find((input) => input.value === 'gg');

    expect(gg?.disabled).toBe(true);
    expect(addButton(fixture).disabled).toBe(false);
  });

  it('adiciona ao carrinho com o tamanho escolhido', async () => {
    const cart = TestBed.inject(CartStore);
    const fixture = await open('camiseta-frieren-jornada');

    const M = swatches(fixture).find((input) => input.value === 'm')!;
    M.click();
    await fixture.whenStable();

    addButton(fixture).click();

    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].variant).toBe('M');
    expect(cart.items()[0].id).toContain(':m');
  });

  it('troca o preço junto com o tamanho da réplica', async () => {
    const fixture = await open('dragon-slayer-guts');
    const price = () => host(fixture).querySelector('.by__now')?.textContent ?? '';

    expect(price()).toContain('590');

    host(fixture).querySelector<HTMLInputElement>('[value="145cm"]')!.click();
    await fixture.whenStable();

    expect(price()).toContain('1.290');
  });

  it('não deixa a escolha do produto anterior vazar para o próximo', async () => {
    const fixture = await open('camiseta-frieren-jornada');
    host(fixture).querySelector<HTMLInputElement>('[value="gg"]');

    fixture.componentRef.setInput('slug', 'chapeu-luffy');
    await fixture.whenStable();

    const marked = swatches(fixture).filter((input) => input.checked);
    expect(marked).toHaveLength(1);
    expect(marked[0].value).toBe('56');
  });

  describe('prateleiras do rodapé', () => {
    const shelves = (fixture: ComponentFixture<ProductPage>) =>
      [...host(fixture).querySelectorAll('app-product-shelf')].map((shelf) => ({
        heading: shelf.querySelector('.sh__title')?.textContent?.trim(),
        animes: [...shelf.querySelectorAll('.pc__anime')].map((el) =>
          el.textContent?.trim(),
        ),
      }));

    it('não empresta produto de outro universo para a prateleira do anime', async () => {
      const fixture = await open('camiseta-frieren-jornada');
      const anime = shelves(fixture)[0];

      expect(anime.heading).toBe('Mais de Frieren');
      expect(new Set(anime.animes)).toEqual(new Set(['Frieren']));
    });

    it('manda o resto do departamento para uma prateleira própria', async () => {
      const fixture = await open('camiseta-frieren-jornada');
      const department = shelves(fixture)[1];

      expect(department.heading).toBe('Também em Camisas');
      expect(department.animes).not.toContain('Frieren');
      expect(department.animes.length).toBeGreaterThan(0);
    });

    it('esconde a prateleira do anime quando a peça é a única dele', async () => {
      const fixture = await open('camiseta-nezuko');
      const headings = shelves(fixture).map((shelf) => shelf.heading);

      expect(headings).toEqual(['Também em Camisas']);
    });
  });
});

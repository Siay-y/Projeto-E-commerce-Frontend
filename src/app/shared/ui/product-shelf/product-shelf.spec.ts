import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Product } from '../../../core/catalog/product';
import { ProductShelf } from './product-shelf';

const PRODUCTS: readonly Product[] = Array.from({ length: 6 }, (_, i) => ({
  id: `p-${i}`,
  slug: `produto-${i}`,
  title: `Produto ${i}`,
  anime: { slug: 'frieren', name: 'Frieren' },
  category: 'camisas' as const,
  price: 100 + i,
  availability: { kind: 'stock' as const, units: 5 },
}));

function fixGeometry(el: Element, values: Record<string, number>) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(el, key, { value, configurable: true });
  }
}

function captureScroll(rail: HTMLElement): ScrollToOptions[] {
  const calls: ScrollToOptions[] = [];
  rail.scrollBy = ((options: ScrollToOptions) => {
    calls.push(options);
  }) as HTMLElement['scrollBy'];
  return calls;
}

describe('ProductShelf', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
  });

  async function render() {
    const fixture: ComponentFixture<ProductShelf> = TestBed.createComponent(ProductShelf);
    fixture.componentRef.setInput('heading', 'Em alta na guilda');
    fixture.componentRef.setInput('products', PRODUCTS);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host,
      rail: host.querySelector<HTMLElement>('.sh__rail')!,
      arrows: [...host.querySelectorAll<HTMLButtonElement>('.sh__arrows button')],
    };
  }

  async function withScroll(
    setup: Awaited<ReturnType<typeof render>>,
    scrollLeft: number,
  ) {
    fixGeometry(setup.rail, { clientWidth: 800, scrollWidth: 2400, scrollLeft });
    setup.rail.dispatchEvent(new Event('scroll'));
    await setup.fixture.whenStable();
  }

  it('renderiza um card por produto', async () => {
    const { host } = await render();

    expect(host.querySelectorAll('app-product-card')).toHaveLength(PRODUCTS.length);
  });

  it('repassa o pedido de adicionar vindo do card', async () => {
    const { fixture, host } = await render();
    const seen: Product[] = [];
    fixture.componentInstance.add.subscribe((product) => seen.push(product));

    host.querySelector<HTMLButtonElement>('.pc__add')!.click();

    expect(seen).toHaveLength(1);
    expect(seen[0].id).toBe('p-0');
  });

  it('mantém as duas setas desligadas quando não há o que rolar', async () => {
    const { arrows } = await render();

    expect(arrows.map((button) => button.disabled)).toEqual([true, true]);
  });

  it('libera só a seta de avançar no início da trilha', async () => {
    const setup = await render();
    await withScroll(setup, 0);

    expect(setup.arrows.map((button) => button.disabled)).toEqual([true, false]);
  });

  it('libera só a seta de voltar no fim da trilha', async () => {
    const setup = await render();
    await withScroll(setup, 1600);

    expect(setup.arrows.map((button) => button.disabled)).toEqual([false, true]);
  });

  it('avança por cards inteiros, e não por uma fração de tela', async () => {
    const setup = await render();
    await withScroll(setup, 0);

    const items = setup.host.querySelectorAll<HTMLElement>('.sh__item');
    fixGeometry(items[0], { offsetLeft: 0 });
    fixGeometry(items[1], { offsetLeft: 240 });

    const calls = captureScroll(setup.rail);

    setup.arrows[1].click();

    expect(calls).toHaveLength(1);
    expect(calls[0].left).toBe(720);
  });

  it('recua a mesma distância que avança', async () => {
    const setup = await render();
    await withScroll(setup, 720);

    const items = setup.host.querySelectorAll<HTMLElement>('.sh__item');
    fixGeometry(items[0], { offsetLeft: 0 });
    fixGeometry(items[1], { offsetLeft: 240 });

    const calls = captureScroll(setup.rail);

    setup.arrows[0].click();

    expect(calls[0].left).toBe(-720);
  });
});

import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Product } from '../../../core/catalog/product';
import { ProductCard } from './product-card';

const BASE: Product = {
  id: 'p-1',
  slug: 'colar-pochita',
  title: 'Colar Pochita em prata 925',
  anime: { slug: 'chainsaw-man', name: 'Chainsaw Man' },
  category: 'acessorios',
  price: 149.9,
  availability: { kind: 'stock', units: 10 },
};

describe('ProductCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
  });

  async function render(patch: Partial<Product> = {}) {
    const fixture: ComponentFixture<ProductCard> = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', { ...BASE, ...patch });
    await fixture.whenStable();
    return fixture;
  }

  function flags(fixture: ComponentFixture<ProductCard>) {
    const host = fixture.nativeElement as HTMLElement;
    return [...host.querySelectorAll('.pc__flag')].map((el) => el.textContent?.trim());
  }

  function addButton(fixture: ComponentFixture<ProductCard>) {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.pc__add',
    )!;
  }

  it('aponta o card para a página do produto', async () => {
    const fixture = await render();
    const link = (fixture.nativeElement as HTMLElement).querySelector('.pc__link');

    expect(link?.getAttribute('href')).toBe('/produto/colar-pochita');
  });

  it('mostra de que anime é a peça', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.pc__anime')?.textContent?.trim()).toBe('Chainsaw Man');
  });

  it('mostra o desconto quando há preço anterior maior', async () => {
    const fixture = await render({ compareAt: 199.9 });

    expect(flags(fixture)).toEqual(['25% OFF']);
    expect((fixture.nativeElement as HTMLElement).querySelector('.pc__was')).not.toBeNull();
  });

  it('não inventa desconto quando o preço anterior não é maior', async () => {
    const fixture = await render({ compareAt: 149.9 });

    expect(flags(fixture)).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).querySelector('.pc__was')).toBeNull();
  });

  it('cala os outros selos quando o produto está esgotado', async () => {
    const fixture = await render({
      availability: { kind: 'stock', units: 0 },
      compareAt: 199.9,
      critical: true,
    });

    expect(flags(fixture)).toEqual(['Esgotado']);
  });

  it('impede a compra do que está esgotado', async () => {
    const fixture = await render({ availability: { kind: 'stock', units: 0 } });

    expect(addButton(fixture).disabled).toBe(true);
  });

  it('não mostra mais de dois selos sobre o quadro', async () => {
    const fixture = await render({ compareAt: 199.9, critical: true, printed: true });

    expect(flags(fixture)).toEqual(['Tiragem limitada', '25% OFF']);
  });

  it('marca a peça impressa em 3D em qualquer departamento', async () => {
    const fixture = await render({ category: 'acessorios', printed: true });

    expect(flags(fixture)).toEqual(['Impresso em 3D']);
  });

  it('avisa das últimas unidades e concorda em número', async () => {
    const note = async (units: number) => {
      const host = (await render({ availability: { kind: 'stock', units } }))
        .nativeElement as HTMLElement;
      return host.querySelector('.pc__note')?.textContent?.trim() ?? null;
    };

    expect(await note(1)).toBe('Última unidade');
    expect(await note(2)).toBe('Últimas 2 unidades');
    expect(await note(4)).toBeNull();
    expect(await note(0)).toBeNull();
  });

  describe('sob encomenda', () => {
    const MADE_TO_ORDER: Partial<Product> = {
      availability: { kind: 'made-to-order', days: 18 },
    };

    it('nunca esgota, porque a peça só passa a existir depois da compra', async () => {
      const fixture = await render(MADE_TO_ORDER);

      expect(addButton(fixture).disabled).toBe(false);
      expect(flags(fixture)).not.toContain('Esgotado');
    });

    it('anuncia o prazo de produção no lugar do estoque', async () => {
      const host = (await render(MADE_TO_ORDER)).nativeElement as HTMLElement;
      const note = host.querySelector('.pc__note');

      expect(note?.textContent?.trim()).toBe('Sob encomenda · 18 dias');
      expect(note?.getAttribute('data-tone')).toBe('info');
    });
  });

  it('anuncia o parcelamento só quando ele existe', async () => {
    const parcel = async (price: number) => {
      const host = (await render({ price })).nativeElement as HTMLElement;
      return host.querySelector('.pc__parcel')?.textContent?.replace(/\s+/g, ' ').trim();
    };

    expect(await parcel(149.9)).toContain('7× de');
    expect(await parcel(30)).toBeUndefined();
  });

  it('emite o produto ao adicionar', async () => {
    const fixture = await render();
    const seen: Product[] = [];
    fixture.componentInstance.add.subscribe((product) => seen.push(product));

    addButton(fixture).click();

    expect(seen).toHaveLength(1);
    expect(seen[0].id).toBe('p-1');
  });

  it('dá ao botão um nome acessível com o produto', async () => {
    const fixture = await render();

    expect(addButton(fixture).getAttribute('aria-label')).toBe(
      'Adicionar Colar Pochita em prata 925 ao carrinho',
    );
  });
});

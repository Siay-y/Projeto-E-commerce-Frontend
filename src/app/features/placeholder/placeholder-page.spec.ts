import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CatalogStore } from '../../core/catalog/catalog-store';
import { PlaceholderPage } from './placeholder-page';

describe('PlaceholderPage', () => {
  let catalog: CatalogStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    catalog = TestBed.inject(CatalogStore);
  });

  async function render(inputs: Record<string, string | undefined>) {
    const fixture: ComponentFixture<PlaceholderPage> =
      TestBed.createComponent(PlaceholderPage);

    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  }

  function titles(host: HTMLElement) {
    return [...host.querySelectorAll('.ph__grid .pc__title')].map((el) =>
      el.textContent?.trim(),
    );
  }

  it('mostra o catálogo inteiro na home', async () => {
    const host = await render({ heading: 'Início' });

    expect(titles(host)).toHaveLength(catalog.all().length);
    expect(host.querySelector('app-product-shelf')).not.toBeNull();
    expect(host.querySelector('.ph__section')?.textContent?.trim()).toBe(
      'Todos os produtos',
    );
  });

  it('trata recorte ausente como recorte vazio', async () => {
    const host = await render({ heading: 'Início', anime: undefined, category: undefined });

    expect(titles(host)).toHaveLength(catalog.all().length);
    expect(host.querySelector('app-product-shelf')).not.toBeNull();
  });

  it('recorta por departamento', async () => {
    const host = await render({ heading: 'Camisas', category: 'camisas' });
    const expected = catalog.byCategory('camisas');

    expect(expected.length).toBeGreaterThan(0);
    expect(titles(host)).toHaveLength(expected.length);
    expect(titles(host).sort()).toEqual(expected.map((p) => p.title).sort());
  });

  it('recorta por anime e usa o nome dele como título', async () => {
    const host = await render({ heading: 'Anime', anime: 'frieren' });
    const expected = catalog.byAnime('frieren');

    expect(expected.length).toBeGreaterThan(0);
    expect(titles(host)).toHaveLength(expected.length);
    expect(host.querySelector('.ph__title')?.textContent?.trim()).toBe('Frieren');
  });

  it('esconde a vitrine num recorte, para não repetir a grade', async () => {
    const host = await render({ heading: 'Cosplay', category: 'cosplay' });

    expect(host.querySelector('app-product-shelf')).toBeNull();
  });

  it('não deixa o slug de um produto virar filtro de anime', async () => {
    const host = await render({ heading: 'Produto', anime: undefined });

    expect(titles(host)).toHaveLength(catalog.all().length);
  });

  it('não estoura com anime desconhecido', async () => {
    const host = await render({ heading: 'Anime', anime: 'nao-existe' });

    expect(titles(host)).toHaveLength(0);
    expect(host.querySelector('.ph__empty')).not.toBeNull();
    expect(host.querySelector('.ph__title')?.textContent?.trim()).toBe('Anime');
  });
});

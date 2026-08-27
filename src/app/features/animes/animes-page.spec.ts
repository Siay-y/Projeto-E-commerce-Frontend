import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CatalogStore } from '../../core/catalog/catalog-store';
import { AnimesPage } from './animes-page';

describe('AnimesPage', () => {
  let fixture: ComponentFixture<AnimesPage>;
  let host: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    fixture = TestBed.createComponent(AnimesPage);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  function names() {
    return [...host.querySelectorAll('.ac__name')].map((el) => el.textContent?.trim());
  }

  async function type(term: string) {
    const input = host.querySelector<HTMLInputElement>('.an__input')!;
    input.value = term;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  function labels() {
    return [...host.querySelectorAll('.ac__count')].map((el) => el.textContent?.trim());
  }

  it('lista todos os animes, com ou sem produto', async () => {
    const catalog = TestBed.inject(CatalogStore);

    expect(names()).toHaveLength(catalog.animes().length);
  });

  it('marca como "Em breve" o anime que ainda não tem peça', async () => {
    const catalog = TestBed.inject(CatalogStore);
    const empty = catalog.animes().filter((a) => catalog.countByAnime(a.slug) === 0);

    expect(empty.length).toBeGreaterThan(0);
    expect(labels().filter((label) => label === 'Em breve')).toHaveLength(empty.length);
  });

  it('não transforma em link o anime sem produto', async () => {
    const soon = [...host.querySelectorAll('.ac__link[data-soon]')];

    expect(soon.length).toBeGreaterThan(0);
    expect(soon.every((el) => el.tagName === 'DIV')).toBe(true);
    expect(host.querySelectorAll('a.ac__link[data-soon]')).toHaveLength(0);
  });

  it('põe os animes com produto na frente dos "Em breve"', async () => {
    const shown = labels();
    const firstSoon = shown.indexOf('Em breve');

    expect(firstSoon).toBeGreaterThan(0);
    expect(shown.slice(firstSoon).every((label) => label === 'Em breve')).toBe(true);
  });

  it('ordena por nome dentro de cada grupo', async () => {
    const shown = names();
    const firstSoon = labels().indexOf('Em breve');
    const groups = [shown.slice(0, firstSoon), shown.slice(firstSoon)];

    for (const group of groups) {
      const sorted = [...group].sort((a, b) => a!.localeCompare(b!, 'pt-BR'));
      expect(group).toEqual(sorted);
    }
  });

  it('leva cada card disponível para a área do anime', async () => {
    const href = host.querySelector('a.ac__link')?.getAttribute('href');

    expect(href).toMatch(/^\/animes\/[a-z0-9-]+$/);
  });

  it('mostra quantos produtos cada anime tem', async () => {
    const catalog = TestBed.inject(CatalogStore);
    const counts = labels()
      .filter((label) => label !== 'Em breve')
      .map((label) => Number(label!.replace(/\D/g, '')));

    expect(counts.every((count) => count > 0)).toBe(true);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(catalog.all().length);
  });

  it('filtra pelo nome, ignorando caixa', async () => {
    await type('chainsaw');

    expect(names()).toEqual(['Chainsaw Man']);
  });

  it('filtra também pelo título original', async () => {
    await type('kimetsu');

    expect(names()).toEqual(['Demon Slayer']);
  });

  it('ignora acento digitado pelo usuário', async () => {
    await type('évangelion');

    expect(names()).toEqual(['Evangelion']);
  });

  it('conta o recorte quando o filtro está ativo', async () => {
    const total = names().length;
    expect(host.querySelector('.an__tally')?.textContent?.trim()).toBe(`${total} animes`);

    await type('chainsaw');
    expect(host.querySelector('.an__tally')?.textContent?.trim()).toBe(
      `1 de ${total} animes`,
    );
  });

  it('explica o vazio em vez de mostrar uma grade em branco', async () => {
    await type('naoexisteesseanime');

    expect(host.querySelector('.an__grid')).toBeNull();
    expect(host.querySelector('.an__empty')?.textContent).toContain('naoexisteesseanime');
  });
});

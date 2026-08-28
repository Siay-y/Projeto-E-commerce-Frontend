import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { routes } from '../../app.routes';
import { PATHS } from '../../core/routing/paths';
import { Header } from './header';

const CAMISAS = PATHS.category('camisas').join('/');
const COSPLAY = PATHS.category('cosplay').join('/');
const ACESSORIOS = PATHS.category('acessorios').join('/');

describe('Header', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
    });
  });

  async function renderAt(path: string) {
    const fixture = TestBed.createComponent(Header);
    await TestBed.inject(Router).navigate([path]);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  function activeHref(host: HTMLElement) {
    return host.querySelector('.hd__link[data-active]')?.getAttribute('href') ?? null;
  }

  it('marca como ativo o link da rota para onde navegou', async () => {
    const host = await renderAt('/animes');
    expect(activeHref(host)).toBe('/animes');
  });

  it('move a marcação ao navegar de novo', async () => {
    const fixture = TestBed.createComponent(Header);
    const router = TestBed.inject(Router);
    const host = fixture.nativeElement as HTMLElement;

    await router.navigateByUrl(CAMISAS);
    await fixture.whenStable();
    expect(activeHref(host)).toBe(CAMISAS);

    await router.navigateByUrl(COSPLAY);
    await fixture.whenStable();
    expect(activeHref(host)).toBe(COSPLAY);
  });

  it('marca exatamente um link por vez', async () => {
    const host = await renderAt(ACESSORIOS);
    expect(host.querySelectorAll('.hd__link[data-active]')).toHaveLength(1);
  });

  it('mantém Animes marcado dentro da área de um anime', async () => {
    const host = await renderAt('/animes/frieren');
    expect(activeHref(host)).toBe('/animes');
  });

  it('não marca nenhum departamento em rotas de fora da navegação', async () => {
    expect(activeHref(await renderAt('/conta'))).toBeNull();
    expect(activeHref(await renderAt('/loot-box'))).toBeNull();
    expect(activeHref(await renderAt('/sobre'))).toBeNull();
  });

  it('ignora a query string ao casar a rota ativa', async () => {
    const fixture = TestBed.createComponent(Header);
    await TestBed.inject(Router).navigate(['/animes/frieren'], {
      queryParams: { tipo: 'camisas' },
    });
    await fixture.whenStable();

    expect(activeHref(fixture.nativeElement as HTMLElement)).toBe('/animes');
  });
});

import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';
import { PATHS } from './core/routing/paths';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
    }).compileComponents();
  });

  async function renderAt(url: string) {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  }

  it('monta a casca da aplicação', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('veste a rota da loja com o cabeçalho completo', async () => {
    const host = await renderAt(PATHS.animes);
    const brand = host.querySelector('a[aria-label]');

    expect(host.querySelector('app-header')).toBeTruthy();
    expect(host.querySelector('app-footer')).toBeTruthy();
    expect(brand?.getAttribute('aria-label')).toContain('ACERTO CRÍTICO');
  });

  it('expõe o link de pular para o conteúdo como primeiro foco', async () => {
    const host = await renderAt(PATHS.animes);

    expect(host.querySelector('.skip')?.getAttribute('href')).toBe('#main');
  });

  it('troca a moldura nas rotas de conta', async () => {
    const host = await renderAt(PATHS.login);

    expect(host.querySelector('app-auth-layout')).toBeTruthy();
    expect(host.querySelector('app-header')).toBeNull();
    expect(host.querySelector('app-site-search')).toBeNull();
    expect(host.querySelector('app-footer')).toBeNull();
  });

  it('mantém o pular para o conteúdo também na moldura de conta', async () => {
    const host = await renderAt(PATHS.login);

    expect(host.querySelector('.skip')?.getAttribute('href')).toBe('#main');
  });
});

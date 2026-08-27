import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
    }).compileComponents();
  });

  it('monta a casca da aplicação', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renderiza o header com a marca', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const brand = host.querySelector('a[aria-label]');

    expect(host.querySelector('app-header')).toBeTruthy();
    expect(brand?.getAttribute('aria-label')).toContain('ACERTO CRÍTICO');
  });

  it('expõe o link de pular para o conteúdo como primeiro foco', () => {
    const fixture = TestBed.createComponent(App);
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('.skip')?.getAttribute('href')).toBe('#main');
  });
});

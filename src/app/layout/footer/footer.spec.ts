import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from '../../app.routes';
import { STORE } from '../../core/store/store-info';
import { FOOTER_PAGES, FOOTER_SECTIONS, LEGAL_LINKS } from '../footer-links';
import { SOCIAL_LINKS } from '../social-links';
import { Footer } from './footer';

describe('Footer', () => {
  let host: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
    });

    const fixture = TestBed.createComponent(Footer);
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  function socialLinks() {
    return [...host.querySelectorAll<HTMLAnchorElement>('.ft__social-link')];
  }

  it('mostra todas as redes configuradas', () => {
    expect(socialLinks()).toHaveLength(SOCIAL_LINKS.length);
    expect(host.querySelectorAll('app-social-icon')).toHaveLength(SOCIAL_LINKS.length);
  });

  it('dá nome acessível a cada rede, porque o ícone sozinho não tem', () => {
    for (const link of socialLinks()) {
      expect(link.getAttribute('aria-label')?.trim()).toBeTruthy();
    }
  });

  it('abre rede social sem entregar a janela de origem', () => {
    for (const link of socialLinks()) {
      const rel = link.getAttribute('rel') ?? '';
      expect(rel).toContain('noopener');
      expect(link.getAttribute('target')).toBe('_blank');
    }
  });

  it('exibe a identificação legal exigida do e-commerce', () => {
    const text = host.textContent ?? '';

    expect(text).toContain(STORE.legalName);
    expect(text).toContain(STORE.cnpj);
  });

  it('mostra o ano corrente no aviso de direitos', () => {
    expect(host.textContent).toContain(String(new Date().getFullYear()));
  });

  it('renderiza cada seção de navegação com os seus links', () => {
    const columns = [...host.querySelectorAll('.ft__col')];
    expect(columns).toHaveLength(FOOTER_SECTIONS.length);

    columns.forEach((column, index) => {
      const section = FOOTER_SECTIONS[index];
      expect(column.querySelector('.ft__col-title')?.textContent?.trim()).toBe(
        section.title,
      );
      expect(column.querySelectorAll('.ft__link')).toHaveLength(section.links.length);
    });
  });

  it('não deixa nenhum link interno sem rota', () => {
    const declared = new Set(
      routes.filter((route) => route.path !== undefined).map((route) => `/${route.path}`),
    );

    const internal = [
      ...FOOTER_SECTIONS.flatMap((section) => section.links),
      ...LEGAL_LINKS,
    ];

    for (const link of internal) {
      expect(declared.has(link.path)).toBe(true);
    }
  });

  it('roteia toda página que o rodapé introduz', () => {
    const hrefs = [...host.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')].map(
      (anchor) => anchor.getAttribute('href'),
    );

    for (const page of FOOTER_PAGES) {
      expect(hrefs).toContain(page.path);
    }
  });
});

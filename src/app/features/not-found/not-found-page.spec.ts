import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { Router, provideRouter } from '@angular/router';

import { RESPONSE_INIT } from '../../core/http/not-found';
import { routes } from '../../app.routes';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('avisa o servidor para responder 404', async () => {
    const init: ResponseInit = {};

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: RESPONSE_INIT, useValue: init },
      ],
    });

    const fixture = TestBed.createComponent(NotFoundPage);
    await fixture.whenStable();

    expect(init.status).toBe(404);
  });

  it('não quebra sem o token, que é o caso do navegador', async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    const fixture = TestBed.createComponent(NotFoundPage);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.nf__title')?.textContent?.trim()).toBe(
      'Essa página não existe',
    );
  });
});

describe('rota curinga', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter(routes)],
    });
  });

  it('mostra o 404 no lugar de mandar para a home', async () => {
    const harness = await RouterTestingHarness.create('/uma-pagina-que-nao-existe');

    expect(harness.routeNativeElement?.querySelector('.nf__code')?.textContent).toContain(
      '404',
    );
    expect(TestBed.inject(Router).url).toBe('/uma-pagina-que-nao-existe');
  });
});

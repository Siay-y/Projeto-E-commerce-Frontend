import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AuthStore } from './auth-store';
import { User } from './user';

const USER: User = { id: 'u-1', name: 'Luiz Santos', email: 'luiz@exemplo.com' };

describe('AuthStore', () => {
  let store: AuthStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    store = TestBed.inject(AuthStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('começa sem saber quem é', () => {
    expect(store.status()).toBe('desconhecido');
    expect(store.isLoggedIn()).toBe(false);
  });

  it('reconhece a sessão existente', async () => {
    const done = store.restore();

    http.expectOne('/api/auth/sessao').flush(USER);
    await done;

    expect(store.status()).toBe('autenticado');
    expect(store.shortName()).toBe('Luiz');
  });

  it('trata 401 na sessão como anônimo, não como erro', async () => {
    const done = store.restore();

    http
      .expectOne('/api/auth/sessao')
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    await done;

    expect(store.status()).toBe('anonimo');
    expect(store.user()).toBeNull();
  });

  it('não repete a leitura de sessão quando chamada em paralelo', async () => {
    const first = store.restore();
    const second = store.restore();

    http.expectOne('/api/auth/sessao').flush(USER);
    await Promise.all([first, second]);

    expect(store.isLoggedIn()).toBe(true);
  });

  it('normaliza e-mail e nome antes de enviar', async () => {
    const done = store.register({
      name: '  Luiz   Santos ',
      email: '  Luiz@Exemplo.COM ',
      password: 'a jornada ao fim',
    });

    const request = http.expectOne('/api/auth/cadastro');

    expect(request.request.body).toEqual({
      name: 'Luiz Santos',
      email: 'luiz@exemplo.com',
      password: 'a jornada ao fim',
    });

    request.flush(USER);
    await done;
  });

  it('devolve o código de erro em vez de estourar', async () => {
    const done = store.login({ email: 'luiz@exemplo.com', password: 'errada12' });

    http
      .expectOne('/api/auth/entrar')
      .flush({ error: 'credenciais-invalidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(await done).toEqual({ ok: false, code: 'credenciais-invalidas' });
    expect(store.isLoggedIn()).toBe(false);
  });

  it('traduz 429 em muitas tentativas', async () => {
    const done = store.login({ email: 'luiz@exemplo.com', password: 'errada12' });

    http
      .expectOne('/api/auth/entrar')
      .flush(null, { status: 429, statusText: 'Too Many Requests' });

    expect(await done).toEqual({ ok: false, code: 'muitas-tentativas' });
  });

  it('desloga localmente mesmo se a API falhar', async () => {
    const restored = store.restore();
    http.expectOne('/api/auth/sessao').flush(USER);
    await restored;

    const done = store.logout();
    http
      .expectOne('/api/auth/sair')
      .flush(null, { status: 500, statusText: 'Server Error' });
    await done;

    expect(store.status()).toBe('anonimo');
    expect(store.user()).toBeNull();
  });
});

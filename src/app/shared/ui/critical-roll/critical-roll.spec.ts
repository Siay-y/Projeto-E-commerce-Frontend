import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { User } from '../../../core/auth/user';
import { CriticalRoll } from './critical-roll';

const USER: User = { id: 'u-1', name: 'Luiz Santos', email: 'luiz@exemplo.com' };

describe('CriticalRoll', () => {
  let fixture: ComponentFixture<CriticalRoll>;
  let host: HTMLElement;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(CriticalRoll);
    host = fixture.nativeElement as HTMLElement;
  });

  async function settleAs(user: User | null) {
    await fixture.whenStable();

    const request = http.expectOne('/api/auth/sessao');
    if (user) {
      request.flush(user);
    } else {
      request.flush(null, { status: 401, statusText: 'Unauthorized' });
    }

    await new Promise((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();
  }

  const rollButton = () => host.querySelector<HTMLButtonElement>('button[appButton]');
  const signupLink = () => host.querySelector<HTMLAnchorElement>('a[appButtonLink]');

  it('não decide nada enquanto a sessão não respondeu', async () => {
    await fixture.whenStable();

    expect(rollButton()).toBeNull();
    expect(signupLink()).toBeNull();
    expect(host.textContent).toContain('Rolagem Crítica');

    http.expectOne('/api/auth/sessao').flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  });

  it('convida o visitante a criar conta em vez de oferecer o dado', async () => {
    await settleAs(null);

    expect(rollButton()).toBeNull();
    expect(signupLink()?.textContent?.trim()).toBe('Criar conta e rolar');
    expect(signupLink()?.getAttribute('href')).toBe('/cadastro?destino=%2Fcarrinho');
  });

  it('não busca rolagem para quem não tem conta', async () => {
    await settleAs(null);

    http.expectNone('/api/rolagem');
  });

  it('oferece o dado a quem entrou', async () => {
    await settleAs(USER);

    http.expectOne('/api/rolagem').flush({ value: null });
    await fixture.whenStable();

    expect(signupLink()).toBeNull();
    expect(rollButton()?.textContent?.trim()).toBe('Rolar o d20');
  });

  it('mostra a recompensa de uma rolagem já feita', async () => {
    await settleAs(USER);

    http.expectOne('/api/rolagem').flush({ value: 20 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();

    expect(host.textContent).toContain('Acerto crítico');
    expect(host.textContent).toContain('Você tirou 20 de 20');
    expect(rollButton()).toBeNull();
  });

  afterEach(() => http.verify());
});

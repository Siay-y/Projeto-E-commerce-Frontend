import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '../config/api';
import { AuthErrorCode, User, codeFrom } from './user';
import { normalizeEmail, normalizeName } from './validators';

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface Registration extends Credentials {
  readonly name: string;
}

export type AuthStatus = 'desconhecido' | 'anonimo' | 'autenticado';

type Outcome = { readonly ok: true } | { readonly ok: false; readonly code: AuthErrorCode };

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _user = signal<User | null>(null);
  private readonly _status = signal<AuthStatus>('desconhecido');
  private readonly _working = signal(false);

  readonly user = this._user.asReadonly();
  readonly status = this._status.asReadonly();
  readonly working = this._working.asReadonly();

  readonly isLoggedIn = computed(() => this._status() === 'autenticado');

  readonly shortName = computed(() => this._user()?.name.split(' ')[0] ?? '');

  private restoring: Promise<void> | null = null;

  restore(): Promise<void> {
    if (!this.isBrowser) return Promise.resolve();
    if (this._status() !== 'desconhecido') return Promise.resolve();
    if (this.restoring) return this.restoring;

    this.restoring = firstValueFrom(this.http.get<User>(`${this.base}/auth/sessao`))
      .then((user) => {
        this._user.set(user);
        this._status.set('autenticado');
      })
      .catch(() => {
        this._user.set(null);
        this._status.set('anonimo');
      })
      .finally(() => {
        this.restoring = null;
      });

    return this.restoring;
  }

  async login(credentials: Credentials): Promise<Outcome> {
    return this.send('/auth/entrar', {
      email: normalizeEmail(credentials.email),
      password: credentials.password,
    });
  }

  async register(data: Registration): Promise<Outcome> {
    return this.send('/auth/cadastro', {
      name: normalizeName(data.name),
      email: normalizeEmail(data.email),
      password: data.password,
    });
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.base}/auth/sair`, {}));
    } catch {}

    this.clear();
  }

  clear(): void {
    this._user.set(null);
    this._status.set('anonimo');
  }

  private async send(path: string, body: object): Promise<Outcome> {
    this._working.set(true);

    try {
      const user = await firstValueFrom(this.http.post<User>(`${this.base}${path}`, body));

      this._user.set(user);
      this._status.set('autenticado');

      return { ok: true };
    } catch (error) {
      const response = error as HttpErrorResponse;

      return { ok: false, code: codeFrom(response.status ?? 0, response.error) };
    } finally {
      this._working.set(false);
    }
  }
}

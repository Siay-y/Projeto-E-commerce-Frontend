import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthStore } from '../../core/auth/auth-store';
import { MAX_PASSWORD } from '../../core/auth/password';
import { messageFor } from '../../core/auth/user';
import { MAX_EMAIL, checkEmail } from '../../core/auth/validators';
import { PATHS } from '../../core/routing/paths';
import { Button } from '../../shared/ui/button/button';
import { FormAlert } from '../../shared/ui/form-alert/form-alert';
import { PasswordField } from '../../shared/ui/password-field/password-field';
import { TextField } from '../../shared/ui/text-field/text-field';
import { AuthShell } from './auth-shell';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AuthShell, Button, FormAlert, PasswordField, TextField],
  styleUrl: './auth-form.scss',
  template: `
    <app-auth-shell
      heading="Entrar"
      subheading="Use o e-mail e a senha da sua conta."
      pitch="Bom te ver de volta."
    >
      <form class="af" novalidate (submit)="submit($event)">
        @if (failure(); as message) {
          <app-form-alert tone="erro">{{ message }}</app-form-alert>
        }

        <app-text-field
          [(value)]="email"
          label="E-mail"
          type="email"
          name="email"
          autocomplete="email"
          inputmode="email"
          enterkeyhint="next"
          icon="mail"
          placeholder="voce@exemplo.com"
          [maxlength]="MAX_EMAIL"
          [error]="emailError()"
          [disabled]="auth.working()"
          (left)="emailTouched.set(true)"
        />

        <app-password-field
          [(value)]="password"
          autocomplete="current-password"
          enterkeyhint="go"
          [maxlength]="MAX_PASSWORD"
          [error]="passwordError()"
          [disabled]="auth.working()"
          (left)="passwordTouched.set(true)"
        />

        <a class="af__aside-link" [routerLink]="PATHS.recover">Esqueci minha senha</a>

        <button appButton type="submit" size="lg" [block]="true" [loading]="auth.working()">
          Entrar
        </button>

        <p class="af__switch">
          Ainda não tem conta?
          <a [routerLink]="PATHS.register" [queryParams]="{ destino: destination }">
            Criar conta
          </a>
        </p>
      </form>
    </app-auth-shell>
  `,
})
export class LoginPage {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly PATHS = PATHS;
  protected readonly MAX_EMAIL = MAX_EMAIL;
  protected readonly MAX_PASSWORD = MAX_PASSWORD;

  protected readonly email = signal('');
  protected readonly password = signal('');

  protected readonly emailTouched = signal(false);
  protected readonly passwordTouched = signal(false);

  protected readonly failure = signal<string | null>(null);

  protected readonly destination = safeDestination(
    inject(ActivatedRoute).snapshot.queryParamMap.get('destino'),
  );

  protected readonly emailError = computed(() =>
    this.emailTouched() ? checkEmail(this.email()) : null,
  );

  protected readonly passwordError = computed(() => {
    if (!this.passwordTouched()) return null;

    return this.password().length === 0 ? 'Informe sua senha.' : null;
  });

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();

    this.emailTouched.set(true);
    this.passwordTouched.set(true);
    this.failure.set(null);

    if (this.emailError() || this.passwordError()) return;

    const result = await this.auth.login({
      email: this.email(),
      password: this.password(),
    });

    if (result.ok) {
      await this.router.navigateByUrl(this.destination);
      return;
    }

    this.failure.set(messageFor(result.code));

    this.password.set('');
    this.passwordTouched.set(false);
  }
}

export function safeDestination(raw: string | null): string {
  if (!raw) return PATHS.account;

  return /^\/(?!\/|\\)/.test(raw) ? raw : PATHS.account;
}

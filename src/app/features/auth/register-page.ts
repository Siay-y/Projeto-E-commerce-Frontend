import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthStore } from '../../core/auth/auth-store';
import { MAX_PASSWORD, checkPassword } from '../../core/auth/password';
import { messageFor } from '../../core/auth/user';
import {
  MAX_EMAIL,
  MAX_NAME,
  checkEmail,
  checkName,
  normalizeEmail,
} from '../../core/auth/validators';
import { PATHS } from '../../core/routing/paths';
import { Button } from '../../shared/ui/button/button';
import { FormAlert } from '../../shared/ui/form-alert/form-alert';
import { PasswordField } from '../../shared/ui/password-field/password-field';
import { TextField } from '../../shared/ui/text-field/text-field';
import { AuthShell } from './auth-shell';
import { safeDestination } from './login-page';

@Component({
  selector: 'app-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AuthShell, Button, FormAlert, PasswordField, TextField],
  styleUrl: './auth-form.scss',
  template: `
    <app-auth-shell
      heading="Criar conta"
      subheading="Três campos e pronto. CPF e endereço só na hora de fechar o pedido."
      pitch="Uma conta, e a sorte fica com você."
    >
      <form class="af" novalidate (submit)="submit($event)">
        @if (failure(); as message) {
          <app-form-alert tone="erro">{{ message }}</app-form-alert>
        }

        <app-text-field
          [(value)]="name"
          label="Nome"
          name="name"
          autocomplete="name"
          enterkeyhint="next"
          icon="user"
          placeholder="Como quer ser chamado"
          [maxlength]="MAX_NAME"
          [error]="nameError()"
          [disabled]="auth.working()"
          (left)="nameTouched.set(true)"
        />

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
          hint="Usamos para a confirmação do pedido e o rastreio."
          [maxlength]="MAX_EMAIL"
          [error]="emailError()"
          [disabled]="auth.working()"
          (left)="emailTouched.set(true)"
        />

        <app-password-field
          [(value)]="password"
          autocomplete="new-password"
          enterkeyhint="go"
          hint="Pelo menos 8 caracteres. Frase longa vale mais que símbolo."
          [meter]="true"
          [context]="context()"
          [maxlength]="MAX_PASSWORD"
          [error]="passwordError()"
          [disabled]="auth.working()"
          (left)="passwordTouched.set(true)"
        />

        <button appButton type="submit" size="lg" [block]="true" [loading]="auth.working()">
          Criar conta
        </button>

        <p class="af__legal">
          Ao criar a conta você aceita os
          <a [routerLink]="PATHS.terms">Termos de uso</a> e a
          <a [routerLink]="PATHS.privacy">Política de privacidade</a>.
        </p>

        <p class="af__switch">
          Já tem conta?
          <a [routerLink]="PATHS.login" [queryParams]="{ destino: destination }">Entrar</a>
        </p>
      </form>
    </app-auth-shell>
  `,
})
export class RegisterPage {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly PATHS = PATHS;
  protected readonly MAX_NAME = MAX_NAME;
  protected readonly MAX_EMAIL = MAX_EMAIL;
  protected readonly MAX_PASSWORD = MAX_PASSWORD;

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');

  protected readonly nameTouched = signal(false);
  protected readonly emailTouched = signal(false);
  protected readonly passwordTouched = signal(false);

  private readonly taken = signal<string | null>(null);

  protected readonly failure = signal<string | null>(null);

  protected readonly destination = safeDestination(
    inject(ActivatedRoute).snapshot.queryParamMap.get('destino'),
  );

  protected readonly context = computed(() => ({
    name: this.name(),
    email: this.email(),
  }));

  protected readonly nameError = computed(() =>
    this.nameTouched() ? checkName(this.name()) : null,
  );

  protected readonly emailError = computed(() => {
    if (this.taken() === normalizeEmail(this.email())) return 'Este e-mail já tem conta.';

    return this.emailTouched() ? checkEmail(this.email()) : null;
  });

  protected readonly passwordError = computed(() => {
    if (!this.passwordTouched()) return null;

    const verdict = checkPassword(this.password(), this.context());

    return verdict.ok ? null : verdict.reason;
  });

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();

    this.nameTouched.set(true);
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
    this.failure.set(null);

    if (this.nameError() || this.emailError() || this.passwordError()) return;

    const result = await this.auth.register({
      name: this.name(),
      email: this.email(),
      password: this.password(),
    });

    if (result.ok) {
      await this.router.navigateByUrl(this.destination);
      return;
    }

    if (result.code === 'email-em-uso') this.taken.set(normalizeEmail(this.email()));

    this.failure.set(messageFor(result.code));

    this.password.set('');
    this.passwordTouched.set(false);
  }
}

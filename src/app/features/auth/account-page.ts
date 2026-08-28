import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthStore } from '../../core/auth/auth-store';
import { PATHS } from '../../core/routing/paths';
import { Button } from '../../shared/ui/button/button';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-account-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon],
  styleUrl: './account-page.scss',
  template: `
    @if (auth.user(); as user) {
      <header class="ac__head">
        <h1 class="ac__title">Olá, {{ auth.shortName() }}</h1>
        <p class="ac__email">{{ user.email }}</p>
      </header>

      <nav class="ac__grid" aria-label="Sua conta">
        <a class="ac__card" [routerLink]="PATHS.orders">
          <app-icon name="bag" [size]="20" aria-hidden="true" />
          <strong>Pedidos</strong>
          <span>O que já saiu e o que é sob encomenda.</span>
        </a>

        <a class="ac__card" [routerLink]="PATHS.addresses">
          <app-icon name="truck" [size]="20" aria-hidden="true" />
          <strong>Endereços</strong>
          <span>Onde entregamos, e o frete já calculado.</span>
        </a>

        <a class="ac__card" [routerLink]="PATHS.security">
          <app-icon name="shield" [size]="20" aria-hidden="true" />
          <strong>Segurança</strong>
          <span>Troque a senha e encerre outras sessões.</span>
        </a>
      </nav>

      <button appButton type="button" variant="secondary" (click)="leave()">
        <app-icon name="logout" [size]="17" aria-hidden="true" />
        Sair da conta
      </button>
    }
  `,
})
export class AccountPage {
  protected readonly PATHS = PATHS;
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected async leave(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl(PATHS.home);
  }
}

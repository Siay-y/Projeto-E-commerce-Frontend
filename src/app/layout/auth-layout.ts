import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { PATHS } from '../core/routing/paths';
import { Icon } from '../shared/ui/icon/icon';
import { Logo } from '../shared/ui/logo/logo';
import { ThemeToggle } from '../shared/ui/theme-toggle/theme-toggle';
import { LEGAL_LINKS } from './footer-links';

@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, Icon, Logo, ThemeToggle],
  styleUrl: './auth-layout.scss',
  template: `
    <a class="skip" href="#main">Pular para o conteúdo</a>

    <div class="al">
      <header class="al__bar">
        <app-logo [size]="30" />

        <div class="al__tools">
          <app-theme-toggle />

          <a class="al__back" [routerLink]="PATHS.home">
            <app-icon name="chevron-left" [size]="16" aria-hidden="true" />
            Voltar à loja
          </a>
        </div>
      </header>

      <main id="main" class="al__main" tabindex="-1">
        <router-outlet />
      </main>

      <footer class="al__legal">
        <p>© {{ year }} Acerto Crítico</p>

        <ul class="al__legal-links">
          @for (link of legal; track link.path) {
            <li><a [routerLink]="link.path">{{ link.label }}</a></li>
          }
        </ul>
      </footer>
    </div>
  `,
})
export class AuthLayout {
  protected readonly PATHS = PATHS;
  protected readonly legal = LEGAL_LINKS;
  protected readonly year = new Date().getFullYear();
}

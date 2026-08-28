import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthStore } from '../../core/auth/auth-store';
import { PATHS } from '../../core/routing/paths';
import { Icon } from '../../shared/ui/icon/icon';
import { NavLink } from '../nav-links';

@Component({
  selector: 'app-nav-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  styleUrl: './nav-sheet.scss',
  host: {
    '[class.is-open]': 'open()',
    '[attr.inert]': "open() ? null : ''",
  },
  template: `
    <div class="sheet__body">
      <ul class="sheet__list">
        @for (link of links(); track link.path) {
          <li>
            <a class="sheet__link" [routerLink]="link.path" routerLinkActive="is-active">
              {{ link.label }}
              <app-icon name="chevron-right" [size]="18" />
            </a>
          </li>
        }
      </ul>

      <div class="sheet__foot">
        <a class="sheet__account" [routerLink]="account().path">
          <app-icon name="user" [size]="18" />
          {{ account().label }}
        </a>

        <p class="sheet__note">
          <app-icon name="shield" [size]="15" />
          Troca garantida em 30 dias
        </p>
      </div>
    </div>
  `,
})
export class NavSheet {
  readonly links = input.required<readonly NavLink[]>();
  readonly open = input(false);

  private readonly auth = inject(AuthStore);

  protected readonly account = computed(() =>
    this.auth.isLoggedIn()
      ? { path: PATHS.account, label: 'Sua conta' }
      : { path: PATHS.login, label: 'Entrar ou criar conta' },
  );
}

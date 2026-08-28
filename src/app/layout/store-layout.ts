import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './footer/footer';
import { Header } from './header/header';
import { UtilityBar } from './utility-bar/utility-bar';

@Component({
  selector: 'app-store-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, UtilityBar, Footer],
  styleUrl: './chrome.scss',
  template: `
    <a class="skip" href="#main">Pular para o conteúdo</a>

    <app-utility-bar />
    <app-header />

    <main id="main" tabindex="-1">
      <router-outlet />
    </main>

    <app-footer />
  `,
})
export class StoreLayout {}

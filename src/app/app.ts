import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './layout/header/header';
import { UtilityBar } from './layout/utility-bar/utility-bar';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, UtilityBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}

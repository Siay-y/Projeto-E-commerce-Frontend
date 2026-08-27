import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { IconD20 } from '../icon-d20/icon-d20';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconD20],
  styleUrl: './not-found.scss',
  template: `
    <span class="nf__mark" aria-hidden="true">
      <app-icon-d20 variant="solid" [size]="96" label="" />
    </span>

    @if (code()) {
      <p class="nf__code">{{ code() }}</p>
    }

    <h1 class="nf__title">{{ heading() }}</h1>

    @if (text()) {
      <p class="nf__text">{{ text() }}</p>
    }

    <div class="nf__actions">
      <ng-content />
    </div>
  `,
})
export class NotFound {
  readonly heading = input.required<string>();

  readonly code = input('');

  readonly text = input('');
}

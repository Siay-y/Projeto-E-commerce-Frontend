import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon } from '../icon/icon';

export type AlertTone = 'erro' | 'ok';

@Component({
  selector: 'app-form-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  styleUrl: './form-alert.scss',
  host: { role: 'alert', '[attr.data-tone]': 'tone()' },
  template: `
    <app-icon [name]="tone() === 'ok' ? 'check' : 'alert'" [size]="18" aria-hidden="true" />
    <span class="fa__text"><ng-content /></span>
  `,
})
export class FormAlert {
  readonly tone = input<AlertTone>('erro');
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Flag } from '../../../core/catalog/flags';

@Component({
  selector: 'app-product-flags',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './product-flags.scss',
  host: {
    '[attr.data-size]': 'size()',
  },
  template: `
    @if (flags().length > 0) {
      <ul>
        @for (flag of flags(); track flag.kind) {
          <li [attr.data-kind]="flag.kind">{{ flag.text }}</li>
        }
      </ul>
    }
  `,
})
export class ProductFlags {
  readonly flags = input.required<readonly Flag[]>();

  readonly size = input<'sm' | 'md'>('sm');
}

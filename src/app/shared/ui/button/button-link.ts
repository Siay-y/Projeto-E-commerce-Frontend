import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ButtonSize, ButtonVariant } from './button';

/**
 * A mesma pele do `Button` sobre um <a> de verdade, para acao que e navegacao.
 * Nao tem `disabled` nem `loading` de proposito: link indisponivel nao se
 * desabilita, se deixa de renderizar.
 *
 * @example
 * <a appButtonLink variant="accent" routerLink="/checkout">Finalizar compra</a>
 */
@Component({
  selector: 'a[appButtonLink]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './button.scss',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-block]': 'block()',
  },
  template: `
    <span class="btn__wipe" aria-hidden="true"></span>
    <span class="btn__content"><ng-content /></span>
  `,
})
export class ButtonLink {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false);
}

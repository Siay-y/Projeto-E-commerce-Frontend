import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { formatBRL } from '../../core/format/money';
import { FREE_SHIPPING_FROM } from '../../core/shipping/free-shipping';
import { IconD20 } from '../../shared/ui/icon-d20/icon-d20';

interface Attribute {
  readonly name: string;
  readonly value: string;
  readonly note: string;
}

@Component({
  selector: 'app-auth-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconD20],
  styleUrl: './auth-shell.scss',
  template: `
    <div class="as__form">
      <header class="as__head">
        <h1 class="as__title">{{ heading() }}</h1>
        <p class="as__sub">{{ subheading() }}</p>
      </header>

      <ng-content />
    </div>

    <aside class="as__sheet" aria-labelledby="as-sheet-title">
      <span class="as__grain" aria-hidden="true"></span>

      <div class="as__die" aria-hidden="true">
        <app-icon-d20 variant="solid" [size]="76" />
      </div>

      <p class="as__kicker">Ficha de aventureiro</p>
      <h2 class="as__pitch" id="as-sheet-title">{{ pitch() }}</h2>

      <dl class="as__attrs">
        @for (attribute of attributes; track attribute.name) {
          <div class="as__attr">
            <dt class="as__attr-name">{{ attribute.name }}</dt>
            <span class="as__leader" aria-hidden="true"></span>
            <dd class="as__attr-value">{{ attribute.value }}</dd>
            <p class="as__attr-note">{{ attribute.note }}</p>
          </div>
        }
      </dl>
    </aside>
  `,
})
export class AuthShell {
  readonly heading = input.required<string>();
  readonly subheading = input.required<string>();
  readonly pitch = input('Conta na Acerto Crítico');

  protected readonly attributes: readonly Attribute[] = [
    {
      name: 'Rolagem',
      value: 'guardada',
      note: 'O resultado do d20 passa a valer na conta, e não no navegador que você limpou.',
    },
    {
      name: 'Frete',
      value: `grátis de ${formatBRL(FREE_SHIPPING_FROM)}`,
      note: 'O endereço fica salvo e o cálculo já chega pronto no carrinho.',
    },
    {
      name: 'Pedidos',
      value: 'todos',
      note: 'O que saiu hoje e o que é sob encomenda, na mesma lista.',
    },
  ];
}

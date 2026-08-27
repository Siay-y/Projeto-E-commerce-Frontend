import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CartStore } from '../../core/cart/cart-store';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-utility-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  styleUrl: './utility-bar.scss',
  template: `
    <div class="ub">
      <p class="ub__item" [class.is-earned]="cart.hasFreeShipping()">
        <app-icon name="truck" [size]="15" />
        {{ cart.shippingHint() }}
      </p>

      <p class="ub__item ub__item--optional">
        <app-icon name="shield" [size]="15" />
        Troca garantida em 30 dias
      </p>

      <nav class="ub__links" aria-label="Atendimento">
        <a href="#">Rastrear pedido</a>
        <a href="#">Ajuda</a>
      </nav>
    </div>
  `,
})
export class UtilityBar {
  protected readonly cart = inject(CartStore);
}

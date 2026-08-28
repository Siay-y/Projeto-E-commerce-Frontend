import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';

import { CartStore } from '../../../core/cart/cart-store';
import { formatBRL } from '../../../core/format/money';
import { ShippingStore } from '../../../core/shipping/shipping-store';
import { ServiceId } from '../../../core/shipping/quote';
import { ZONE_LABEL, formatCep } from '../../../core/shipping/zones';
import { Icon } from '../icon/icon';

const KILOS = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

@Component({
  selector: 'app-shipping-calc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  styleUrl: './shipping-calc.scss',
  template: `
    <h3 class="sc__title">
      <app-icon name="truck" [size]="17" />
      Calcular frete
    </h3>

    <form class="sc__form" (submit)="submit($event)">
      <label class="sc__field">
        <span class="sr-only">CEP de entrega</span>
        <input
          class="sc__input"
          type="text"
          inputmode="numeric"
          autocomplete="postal-code"
          placeholder="00000-000"
          maxlength="9"
          [value]="shipping.cep()"
          (input)="type($event)"
        />
      </label>

      <button class="sc__go" type="submit" [disabled]="shipping.calculating()">
        {{ shipping.calculating() ? 'Calculando' : 'Calcular' }}
      </button>
    </form>

    @if (shipping.error(); as problem) {
      <p class="sc__error" role="alert">{{ problem }}</p>
    }

    @if (shipping.quote(); as quote) {
      <p class="sc__zone">
        Entrega no {{ zoneLabel(quote.zone) }}, {{ kg(quote.billableKg) }} kg cobrados
      </p>

      <ul class="sc__services">
        @for (service of quote.services; track service.id) {
          <li>
            <label class="sc__service" [attr.data-on]="service.id === shipping.chosen()">
              <input
                class="sc__radio"
                type="radio"
                name="frete"
                [value]="service.id"
                [checked]="service.id === shipping.chosen()"
                (change)="pick(service.id)"
              />
              <span class="sc__service-name">{{ service.label }}</span>
              <span class="sc__service-days">{{ service.days }} dias úteis</span>
              <span class="sc__service-price">{{ label(service.id, service.price) }}</span>
            </label>
          </li>
        }
      </ul>

      @if (quote.shipments.length > 1) {
        <!-- Dois envios saem em datas diferentes, e cobrar so um frete nao pode
             esconder que a replica demora. -->
        <ul class="sc__splits">
          @for (shipment of quote.shipments; track shipment.label) {
            <li>
              <strong>{{ shipment.label }}</strong>
              @if (shipment.readyInDays > 0) {
                sai em {{ shipment.readyInDays }} dias, chega
                {{ shipment.readyInDays + shipment.days }} dias após a compra
              } @else {
                sai hoje, chega em {{ shipment.days }} dias úteis
              }
            </li>
          }
        </ul>
        <p class="sc__splits-note">Dois envios, e você paga um frete só.</p>
      }
    }
  `,
})
export class ShippingCalc {
  protected readonly shipping = inject(ShippingStore);
  private readonly cart = inject(CartStore);

  protected readonly zoneLabel = (zone: keyof typeof ZONE_LABEL) => ZONE_LABEL[zone];

  protected readonly kg = (value: number) => KILOS.format(value);

  constructor() {
    afterNextRender(() => this.shipping.restore());
  }

  protected label(id: ServiceId, price: number): string {
    return this.cart.hasFreeShipping() && id === 'padrao' ? 'Grátis' : formatBRL(price);
  }

  protected type(event: Event): void {
    const input = event.target as HTMLInputElement;
    const masked = formatCep(input.value);

    input.value = masked;
    this.shipping.cep.set(masked);
    this.shipping.clear();
  }

  protected pick(id: ServiceId): void {
    this.shipping.chosen.set(id);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    void this.shipping.calculate();
  }

  protected readonly free = computed(() => this.cart.hasFreeShipping());
}

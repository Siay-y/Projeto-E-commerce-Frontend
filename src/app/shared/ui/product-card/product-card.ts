import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { flagsFor } from '../../../core/catalog/flags';
import {
  OPTION_AXIS,
  Product,
  cardAvailability,
  displayPrice,
  isSoldOut,
  priceVaries,
} from '../../../core/catalog/product';
import { formatBRL, installmentsFor } from '../../../core/format/money';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { IconD20 } from '../icon-d20/icon-d20';
import { PointerTrack } from '../pointer-track/pointer-track';
import { ProductFlags } from '../product-flags/product-flags';

interface Note {
  readonly tone: 'urgent' | 'info';
  readonly text: string;
}

const LOW_STOCK = 3;

const MAX_FLAGS = 2;

const SCORE = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, Icon, IconD20, ProductFlags],
  // O card E o elemento que reage, entao a diretiva entra pelo proprio host.
  hostDirectives: [PointerTrack],
  styleUrl: './product-card.scss',
  host: {
    '[class.is-out]': 'soldOut()',
  },
  template: `
    <div class="pc__frame">
      @if (product().image; as image) {
        <img
          class="pc__img"
          [src]="image"
          [attr.alt]="product().title"
          [attr.loading]="priority() ? 'eager' : 'lazy'"
          [attr.fetchpriority]="priority() ? 'high' : null"
          decoding="async"
        />
      } @else {
        <!-- Sem foto ainda: a marca ocupa o quadro em vez de um vazio cinza. -->
        <span class="pc__mark" aria-hidden="true">
          <app-icon-d20 variant="solid" [size]="56" label="" />
        </span>
      }

      <app-product-flags class="pc__flags" [flags]="flags()" />
    </div>

    <div class="pc__body">
      <p class="pc__anime">{{ product().anime.name }}</p>

      <h3 class="pc__title">
        <a class="pc__link" [routerLink]="['/produto', product().slug]">
          {{ product().title }}
        </a>
      </h3>

      @if (product().rating; as rating) {
        <p class="pc__rating">
          <!-- Uma estrela cheia + o numero, e nao cinco glifos: no tamanho do
               card cinco estrelas viram ruido e o numero e mais rapido de ler. -->
          <svg class="pc__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"
            />
          </svg>
          <span aria-hidden="true">{{ score() }}</span>
          <span class="pc__votes" aria-hidden="true">({{ rating.count }})</span>
          <span class="sr-only">
            Nota {{ score() }} de 5, {{ rating.count }} avaliações
          </span>
        </p>
      }

      <p class="pc__price">
        @if (wasLabel(); as was) {
          <s class="pc__was">{{ was }}</s>
        }
        @if (varies()) {
          <span class="pc__from">A partir de</span>
        }
        <span class="pc__now">{{ nowLabel() }}</span>
      </p>

      @if (installment(); as parcel) {
        <p class="pc__parcel">
          {{ parcel.count }}&times; de {{ parcel.value }} sem juros
        </p>
      }

      <div class="pc__foot">
        @if (availabilityNote(); as note) {
          <p class="pc__note" [attr.data-tone]="note.tone">{{ note.text }}</p>
        }

        <!-- Produto com tamanho nao pode ser adicionado daqui: o botao leva a
             pagina, que e onde a escolha existe. -->
        @if (choose(); as prompt) {
          <button
            appButton
            class="pc__add"
            type="button"
            variant="secondary"
            size="sm"
            [block]="true"
            [routerLink]="['/produto', product().slug]"
            [attr.aria-label]="prompt + ' de ' + product().title"
          >
            {{ prompt }}
          </button>
        } @else {
          <button
            appButton
            class="pc__add"
            type="button"
            variant="secondary"
            size="sm"
            [block]="true"
            [disabled]="soldOut()"
            [attr.aria-label]="addLabel()"
            (click)="add.emit(product())"
          >
            @if (!soldOut()) {
              <app-icon name="plus" [size]="17" />
            }
            {{ soldOut() ? 'Esgotado' : 'Adicionar' }}
          </button>
        }
      </div>
    </div>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();

  readonly priority = input(false);

  readonly add = output<Product>();

  private readonly availability = computed(() => cardAvailability(this.product()));

  protected readonly soldOut = computed(() => isSoldOut(this.availability()));

  protected readonly varies = computed(() => priceVaries(this.product()));

  protected readonly choose = computed(() => {
    const options = this.product().options;
    if (this.soldOut() || !options || options.values.length === 0) return null;

    return OPTION_AXIS[options.axis].prompt;
  });

  protected readonly nowLabel = computed(() => formatBRL(displayPrice(this.product())));

  protected readonly wasLabel = computed(() => {
    const compareAt = this.product().compareAt;
    const price = displayPrice(this.product());
    return compareAt !== undefined && compareAt > price ? formatBRL(compareAt) : null;
  });

  protected readonly installment = computed(() => {
    const parcel = installmentsFor(displayPrice(this.product()));
    return parcel && { count: parcel.count, value: formatBRL(parcel.value) };
  });

  protected readonly score = computed(() => {
    const rating = this.product().rating;
    return rating ? SCORE.format(rating.average) : '';
  });

  protected readonly flags = computed(() => flagsFor(this.product(), MAX_FLAGS));

  protected readonly availabilityNote = computed<Note | null>(() => {
    const availability = this.availability();

    if (availability.kind === 'made-to-order') {
      return { tone: 'info', text: `Sob encomenda · ${availability.days} dias` };
    }

    const { units } = availability;
    if (units <= 0 || units > LOW_STOCK) return null;

    return {
      tone: 'urgent',
      text: units === 1 ? 'Última unidade' : `Últimas ${units} unidades`,
    };
  });

  protected readonly addLabel = computed(() =>
    this.soldOut()
      ? `${this.product().title} está esgotado`
      : `Adicionar ${this.product().title} ao carrinho`,
  );
}

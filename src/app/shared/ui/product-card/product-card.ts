import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product } from '../../../core/catalog/product';
import { discountPercent, formatBRL, installmentsFor } from '../../../core/format/money';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { IconD20 } from '../icon-d20/icon-d20';
import { PointerTrack } from '../pointer-track/pointer-track';

type FlagKind = 'crit' | 'off' | 'print' | 'out';

interface Flag {
  readonly kind: FlagKind;
  readonly text: string;
}

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
  imports: [RouterLink, Button, Icon, IconD20],
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

      @if (flags().length > 0) {
        <ul class="pc__flags">
          @for (flag of flags(); track flag.kind) {
            <li class="pc__flag" [attr.data-kind]="flag.kind">{{ flag.text }}</li>
          }
        </ul>
      }
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
      </div>
    </div>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();

  readonly priority = input(false);

  readonly add = output<Product>();

  protected readonly soldOut = computed(() => {
    const availability = this.product().availability;
    return availability.kind === 'stock' && availability.units <= 0;
  });

  protected readonly nowLabel = computed(() => formatBRL(this.product().price));

  protected readonly wasLabel = computed(() => {
    const { price, compareAt } = this.product();
    return compareAt !== undefined && compareAt > price ? formatBRL(compareAt) : null;
  });

  protected readonly installment = computed(() => {
    const parcel = installmentsFor(this.product().price);
    return parcel && { count: parcel.count, value: formatBRL(parcel.value) };
  });

  protected readonly score = computed(() => {
    const rating = this.product().rating;
    return rating ? SCORE.format(rating.average) : '';
  });

  protected readonly flags = computed<readonly Flag[]>(() => {
    const product = this.product();

    if (this.soldOut()) return [{ kind: 'out', text: 'Esgotado' }];

    const flags: Flag[] = [];
    if (product.critical) flags.push({ kind: 'crit', text: 'Tiragem limitada' });

    const off = discountPercent(product.price, product.compareAt);
    if (off > 0) flags.push({ kind: 'off', text: `${off}% OFF` });

    if (product.printed) flags.push({ kind: 'print', text: 'Impresso em 3D' });

    return flags.slice(0, MAX_FLAGS);
  });

  protected readonly availabilityNote = computed<Note | null>(() => {
    const availability = this.product().availability;

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

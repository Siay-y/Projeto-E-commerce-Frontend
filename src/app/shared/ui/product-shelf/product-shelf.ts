import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Product } from '../../../core/catalog/product';
import { Icon } from '../icon/icon';
import { IconButton } from '../icon-button/icon-button';
import { ProductCard } from '../product-card/product-card';

const EDGE = 2;

const EAGER = 2;

@Component({
  selector: 'app-product-shelf',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, IconButton, ProductCard],
  styleUrl: './product-shelf.scss',
  template: `
    <header class="sh__head">
      <div class="sh__naming">
        @if (kicker()) {
          <p class="sh__kicker">{{ kicker() }}</p>
        }
        <h2 class="sh__title">{{ heading() }}</h2>
      </div>

      <div class="sh__tools">
        @if (seeAll(); as target) {
          <a class="sh__all" [routerLink]="target">
            Ver tudo
            <app-icon name="chevron-right" [size]="16" />
          </a>
        }

        <!-- Sempre no DOM, invisiveis quando nao ha o que rolar: aparecer depois
             da hidratacao empurraria o cabecalho da prateleira. -->
        <div class="sh__arrows" [class.is-idle]="!scrollable()">
          <button
            appIconButton
            size="sm"
            type="button"
            aria-label="Ver produtos anteriores"
            [disabled]="atStart()"
            (click)="page(-1)"
          >
            <app-icon name="chevron-left" />
          </button>
          <button
            appIconButton
            size="sm"
            type="button"
            aria-label="Ver mais produtos"
            [disabled]="atEnd()"
            (click)="page(1)"
          >
            <app-icon name="chevron-right" />
          </button>
        </div>
      </div>
    </header>

    <ul class="sh__rail" #rail [attr.aria-label]="heading()" (scroll)="measure()">
      @for (product of products(); track product.id; let i = $index) {
        <li class="sh__item" #item>
          <app-product-card
            [product]="product"
            [priority]="i < eager"
            (add)="add.emit($event)"
          />
        </li>
      }
    </ul>
  `,
})
export class ProductShelf {
  private readonly destroyRef = inject(DestroyRef);

  private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
  private readonly items = viewChildren<ElementRef<HTMLElement>>('item');

  readonly heading = input.required<string>();
  readonly kicker = input('');
  readonly products = input.required<readonly Product[]>();

  readonly seeAll = input<string | null>(null);

  readonly add = output<Product>();

  protected readonly eager = EAGER;

  protected readonly scrollable = signal(false);
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(true);

  constructor() {
    afterNextRender(() => {
      this.measure();

      if (typeof ResizeObserver === 'undefined') return;

      const observer = new ResizeObserver(() => this.measure());
      const rail = this.rail()?.nativeElement;
      if (rail) observer.observe(rail);

      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected measure(): void {
    const rail = this.rail()?.nativeElement;
    if (!rail) return;

    const max = rail.scrollWidth - rail.clientWidth;

    this.scrollable.set(max > EDGE);
    this.atStart.set(rail.scrollLeft <= EDGE);
    this.atEnd.set(rail.scrollLeft >= max - EDGE);
  }

  protected page(direction: 1 | -1): void {
    const rail = this.rail()?.nativeElement;
    if (!rail) return;

    rail.scrollBy({ left: direction * this.stride(rail), behavior: this.behavior() });
  }

  private stride(rail: HTMLElement): number {
    const nodes = this.items();
    const first = nodes[0]?.nativeElement;
    const second = nodes[1]?.nativeElement;

    const step = first && second ? second.offsetLeft - first.offsetLeft : 0;
    if (step <= 0) return rail.clientWidth;

    return Math.max(step, Math.floor(rail.clientWidth / step) * step);
  }

  private behavior(): ScrollBehavior {
    const reduced =
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    return reduced ? 'auto' : 'smooth';
  }
}

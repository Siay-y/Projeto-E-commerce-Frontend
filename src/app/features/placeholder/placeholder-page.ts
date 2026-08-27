import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button],
  styleUrl: './placeholder-page.scss',
  template: `
    <div class="ph__band">
      <header class="ph__head">
        <div>
          <p class="ph__kicker">Módulo em construção</p>
          <h1 class="ph__title">{{ heading() }}</h1>
        </div>

        <div class="ph__cta">
          <button appButton variant="secondary">Ver novidades</button>
          <button appButton variant="accent">Montar Loot Box</button>
        </div>
      </header>
    </div>

    <section class="ph">
      <div class="ph__grid">
        @for (card of cards; track card) {
          <article class="card" aria-hidden="true">
            <div class="card__art"></div>
            <div class="card__line card__line--title"></div>
            <div class="card__line card__line--sub"></div>
            <div class="card__price"></div>
          </article>
        }
      </div>
    </section>
  `,
})
export class PlaceholderPage {
  readonly heading = input.required<string>();

  protected readonly cards = Array.from({ length: 12 }, (_, index) => index);
}

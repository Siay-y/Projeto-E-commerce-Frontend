import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Anime } from '../../../core/catalog/anime';
import { PointerTrack } from '../pointer-track/pointer-track';

@Component({
  selector: 'app-anime-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, PointerTrack],
  styleUrl: './anime-card.scss',
  template: `
    <ng-template #inside>
      <span class="ac__frame">
        @if (anime().cover; as cover) {
          <img class="ac__art" [src]="cover" alt="" loading="lazy" decoding="async" />
        } @else {
          <!-- Sem capa ainda: a inicial vira a marca do anime. Distingue um
               card do outro, coisa que doze quadros iguais nao fariam. -->
          <span class="ac__initial" aria-hidden="true">{{ initial() }}</span>
        }
      </span>

      <span class="ac__body">
        <span class="ac__name">{{ anime().name }}</span>

        @if (anime().originalName; as original) {
          <span class="ac__original">{{ original }}</span>
        }

        <span class="ac__count">{{ countLabel() }}</span>
      </span>
    </ng-template>

    @if (available()) {
      <a appPointerTrack class="ac__link" [routerLink]="['/animes', anime().slug]">
        <ng-container [ngTemplateOutlet]="inside" />
      </a>
    } @else {
      <div class="ac__link" data-soon="true">
        <ng-container [ngTemplateOutlet]="inside" />
      </div>
    }
  `,
})
export class AnimeCard {
  readonly anime = input.required<Anime>();

  readonly count = input(0);

  protected readonly available = computed(() => this.count() > 0);

  protected readonly initial = computed(() => this.anime().name.charAt(0).toUpperCase());

  protected readonly countLabel = computed(() => {
    const count = this.count();
    if (count === 0) return 'Em breve';

    return count === 1 ? '1 produto' : `${count} produtos`;
  });
}

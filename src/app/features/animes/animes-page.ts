import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { Anime } from '../../core/catalog/anime';
import { CatalogStore } from '../../core/catalog/catalog-store';
import { AnimeCard } from '../../shared/ui/anime-card/anime-card';
import { Icon } from '../../shared/ui/icon/icon';

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

interface Row {
  readonly anime: Anime;
  readonly count: number;
}

@Component({
  selector: 'app-animes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnimeCard, Icon],
  styleUrl: './animes-page.scss',
  template: `
    <div class="an__band">
      <header class="an__head">
        <p class="an__kicker">Catálogo</p>
        <h1 class="an__title">Escolha o seu anime</h1>
        <p class="an__lede">
          Camisas, acessórios, action figures, cosplay e réplicas. Tudo
          organizado por onde veio.
        </p>
      </header>
    </div>

    <section class="an">
      <div class="an__tools">
        <label class="an__filter">
          <span class="sr-only">Filtrar animes pelo nome</span>
          <app-icon name="search" [size]="18" />
          <input
            class="an__input"
            type="search"
            autocomplete="off"
            placeholder="Filtrar animes"
            [value]="query()"
            (input)="filter($event)"
          />
        </label>

        <p class="an__tally" role="status">{{ tally() }}</p>
      </div>

      @if (visible().length > 0) {
        <ul class="an__grid">
          @for (row of visible(); track row.anime.slug) {
            <li>
              <app-anime-card [anime]="row.anime" [count]="row.count" />
            </li>
          }
        </ul>
      } @else {
        <p class="an__empty">
          Nenhum anime encontrado para <strong>{{ query() }}</strong>. Tente
          outro nome, ou o título original, como “Kimetsu no Yaiba”.
        </p>
      }
    </section>
  `,
})
export class AnimesPage {
  private readonly catalog = inject(CatalogStore);

  protected readonly query = signal('');

  private readonly listed = computed<readonly Row[]>(() =>
    this.catalog
      .animes()
      .map((anime) => ({ anime, count: this.catalog.countByAnime(anime.slug) }))
      .sort((a, b) => {
        const soon = Number(a.count === 0) - Number(b.count === 0);
        return soon !== 0 ? soon : a.anime.name.localeCompare(b.anime.name, 'pt-BR');
      }),
  );

  protected readonly visible = computed(() => {
    const term = fold(this.query());
    if (!term) return this.listed();

    return this.listed().filter(
      ({ anime }) =>
        fold(anime.name).includes(term) || fold(anime.originalName ?? '').includes(term),
    );
  });

  protected readonly tally = computed(() => {
    const shown = this.visible().length;
    const total = this.listed().length;
    const noun = shown === 1 ? 'anime' : 'animes';

    return shown === total ? `${total} ${noun}` : `${shown} de ${total} animes`;
  });

  protected filter(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RESPONSE_INIT, markNotFound } from '../../core/http/not-found';
import { CATEGORIES } from '../../core/catalog/category';
import { PATHS } from '../../core/routing/paths';
import { ButtonLink } from '../../shared/ui/button/button-link';
import { NotFound } from '../../shared/ui/not-found/not-found';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonLink, NotFound],
  styleUrl: './not-found-page.scss',
  template: `
    <app-not-found
      code="Erro 404"
      heading="Essa página não existe"
      text="O link pode estar quebrado, ou o endereço mudou. Um teste de percepção
            mal rolado acontece com todo mundo."
    >
      <a appButtonLink variant="accent" [routerLink]="PATHS.animes">Ver todos os animes</a>
      <a appButtonLink variant="secondary" [routerLink]="PATHS.home">Voltar ao início</a>
    </app-not-found>

    <nav class="nfp__departments" aria-label="Departamentos">
      <p class="nfp__hint">Ou vá direto para um departamento</p>
      <ul>
        @for (category of departments; track category.slug) {
          <li>
            <a [routerLink]="PATHS.category(category.slug)">{{ category.label }}</a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class NotFoundPage {
  protected readonly PATHS = PATHS;
  protected readonly departments = CATEGORIES;

  constructor() {
    markNotFound(inject(RESPONSE_INIT, { optional: true }));
  }
}

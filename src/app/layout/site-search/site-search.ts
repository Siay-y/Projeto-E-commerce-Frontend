import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { Icon } from '../../shared/ui/icon/icon';

const TYPING_FIELDS = /^(?:INPUT|TEXTAREA|SELECT)$/;

@Component({
  selector: 'app-site-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  styleUrl: './site-search.scss',
  template: `
    <form class="ss" role="search" (submit)="submit($event)">
      <app-icon class="ss__glass" name="search" [size]="18" />

      <input
        #field
        class="ss__field"
        type="search"
        name="q"
        autocomplete="off"
        spellcheck="false"
        enterkeyhint="search"
        placeholder="Buscar por produto, universo ou personagem"
        aria-label="Buscar produtos"
      />

      <kbd class="ss__key" aria-hidden="true">/</kbd>
    </form>
  `,
})
export class SiteSearch {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');

  constructor() {
    afterNextRender(() => {
      window.addEventListener('keydown', this.onShortcut);
      this.destroyRef.onDestroy(() => window.removeEventListener('keydown', this.onShortcut));
    });
  }

  protected submit(event: Event): void {
    event.preventDefault();

    const term = this.field()?.nativeElement.value.trim();
    if (!term) return;

    void this.router.navigate(['/catalogo'], { queryParams: { q: term } });
  }

  private readonly onShortcut = (event: KeyboardEvent): void => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;

    const target = event.target as HTMLElement | null;
    if (target?.isContentEditable || TYPING_FIELDS.test(target?.tagName ?? '')) return;

    event.preventDefault();
    this.field()?.nativeElement.focus();
  };
}

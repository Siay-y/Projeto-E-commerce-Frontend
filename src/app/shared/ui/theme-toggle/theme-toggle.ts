import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeStore } from '../../../core/theme/theme-store';
import { IconButton } from '../icon-button/icon-button';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconButton],
  styleUrl: './theme-toggle.scss',
  template: `
    <button
      appIconButton
      type="button"
      (click)="store.toggle()"
      [attr.aria-label]="hint()"
      [attr.title]="hint()"
      [attr.aria-pressed]="store.isDark()"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        [class.is-dark]="store.isDark()"
        aria-hidden="true"
      >
        <mask id="ac-eclipse">
          <rect x="0" y="0" width="24" height="24" fill="#fff" />
          <circle class="tt__bite" fill="#000" />
        </mask>

        <g class="tt">
          <circle class="tt__orb" cx="12" cy="12" fill="currentColor" mask="url(#ac-eclipse)" />
          <g class="tt__rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 1.6v2.2" />
            <path d="M12 20.2v2.2" />
            <path d="M22.4 12h-2.2" />
            <path d="M3.8 12H1.6" />
            <path d="M19.35 4.65 17.8 6.2" />
            <path d="M6.2 17.8l-1.55 1.55" />
            <path d="M19.35 19.35 17.8 17.8" />
            <path d="M6.2 6.2 4.65 4.65" />
          </g>
        </g>
      </svg>
    </button>
  `,
})
export class ThemeToggle {
  protected readonly store = inject(ThemeStore);

  protected readonly hint = computed(() =>
    this.store.isDark() ? 'Mudar para o tema claro' : 'Mudar para o tema escuro',
  );
}

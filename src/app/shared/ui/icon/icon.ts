import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'search'
  | 'bag'
  | 'menu'
  | 'close'
  | 'user'
  | 'chevron-left'
  | 'chevron-right'
  | 'plus'
  | 'truck'
  | 'shield'
  | 'trash'
  | 'mail'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'alert'
  | 'check'
  | 'logout';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }
  `,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
    >
      @switch (name()) {
        @case ('search') {
          <circle cx="11" cy="11" r="7" />
          <path d="M20.5 20.5 16 16" />
        }
        @case ('bag') {
          <path d="M5.5 7.5h13l-1 11.2a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8l-1-11.2Z" />
          <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
        }
        @case ('menu') {
          <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
        }
        @case ('close') {
          <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
        }
        @case ('user') {
          <circle cx="12" cy="8" r="3.75" />
          <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
        }
        @case ('chevron-left') {
          <path d="M14.5 5.5 8 12l6.5 6.5" />
        }
        @case ('chevron-right') {
          <path d="M9.5 5.5 16 12l-6.5 6.5" />
        }
        @case ('plus') {
          <path d="M12 5.5v13M5.5 12h13" />
        }
        @case ('truck') {
          <path d="M2.5 6h9.5v9.5H2.5z" />
          <path d="M12 9.5h3.7l2.8 2.8v3.2H12z" />
          <circle cx="6.4" cy="17.6" r="1.9" />
          <circle cx="15.6" cy="17.6" r="1.9" />
        }
        @case ('shield') {
          <path d="M12 2.9 19 5.5v5.2c0 4.2-2.8 7.9-7 9.3-4.2-1.4-7-5.1-7-9.3V5.5z" />
          <path d="m9 12.1 2.2 2.2 4-4.2" />
        }
        @case ('trash') {
          <path d="M4 6.8h16" />
          <path d="M9.6 6.8V5.2a1.7 1.7 0 0 1 1.7-1.7h1.4a1.7 1.7 0 0 1 1.7 1.7v1.6" />
          <path d="M6.6 6.8l.75 12.1a1.9 1.9 0 0 0 1.9 1.8h5.5a1.9 1.9 0 0 0 1.9-1.8l.75-12.1" />
          <path d="M10.4 10.6v6.2M13.6 10.6v6.2" />
        }
        @case ('mail') {
          <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.2" />
          <path d="m3.4 7 7.5 5.4a2 2 0 0 0 2.2 0L20.6 7" />
        }
        @case ('lock') {
          <rect x="4.2" y="10.4" width="15.6" height="10.2" rx="2.2" />
          <path d="M8 10.4V7.6a4 4 0 0 1 8 0v2.8" />
        }
        @case ('eye') {
          <path d="M2.2 12S5.8 5.6 12 5.6 21.8 12 21.8 12 18.2 18.4 12 18.4 2.2 12 2.2 12Z" />
          <circle cx="12" cy="12" r="3.2" />
        }
        @case ('eye-off') {
          <path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.6c6.2 0 9.8 6.4 9.8 6.4a17 17 0 0 1-3.2 4" />
          <path d="M6.4 7.6A16.8 16.8 0 0 0 2.2 12S5.8 18.4 12 18.4a9.4 9.4 0 0 0 4-.9" />
          <path d="M9.8 9.9a3.2 3.2 0 0 0 4.4 4.4" />
          <path d="M3.6 3.6l16.8 16.8" />
        }
        @case ('alert') {
          <circle cx="12" cy="12" r="9.2" />
          <path d="M12 7.4v5.2" />
          <path d="M12 16.3h.01" />
        }
        @case ('check') {
          <circle cx="12" cy="12" r="9.2" />
          <path d="m8.1 12.2 2.7 2.7 5.1-5.6" />
        }
        @case ('logout') {
          <path d="M14.5 4.5H6.8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7.7" />
          <path d="M16.4 8.4 20 12l-3.6 3.6" />
          <path d="M20 12h-9.6" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly label = input('');
}

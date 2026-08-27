import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'search'
  | 'bag'
  | 'menu'
  | 'close'
  | 'user'
  | 'chevron-right'
  | 'truck'
  | 'shield';

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
        @case ('chevron-right') {
          <path d="M9.5 5.5 16 12l-6.5 6.5" />
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
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly label = input('');
}

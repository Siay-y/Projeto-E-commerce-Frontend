import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SocialNetwork = 'instagram' | 'whatsapp' | 'x' | 'tiktok' | 'youtube';

@Component({
  selector: 'app-social-icon',
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
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (network()) {
        @case ('instagram') {
          <rect x="3" y="3" width="18" height="18" rx="5.2" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
        }
        @case ('whatsapp') {
          <path d="M3.8 20.2 5 16.6a7.9 7.9 0 1 1 3 2.9z" />
          <path
            d="M9.5 9.6c0-.6.45-1.05 1-1.05l.9 1.9-.75.75a5.3 5.3 0 0 0 2.15 2.15l.75-.75
               1.9.9c0 .55-.45 1-1.05 1A5.8 5.8 0 0 1 9.5 9.6"
          />
        }
        @case ('x') {
          <path d="M4.5 4.5 19.5 19.5" />
          <path d="M19.5 4.5 4.5 19.5" />
        }
        @case ('tiktok') {
          <path d="M15.2 3.5v9.9a4.3 4.3 0 1 1-3.6-4.24" />
          <path d="M15.2 3.5a4.8 4.8 0 0 0 4.5 3.7" />
        }
        @case ('youtube') {
          <rect x="2.6" y="5.6" width="18.8" height="12.8" rx="4" />
          <path d="M10.5 9.7 15.3 12l-4.8 2.3z" />
        }
      }
    </svg>
  `,
})
export class SocialIcon {
  readonly network = input.required<SocialNetwork>();
  readonly size = input(19);
}

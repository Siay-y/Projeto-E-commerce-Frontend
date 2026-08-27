import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconD20 } from '../icon-d20/icon-d20';

interface Glyph {
  readonly char: string;
  readonly soft: boolean;
  readonly gap: boolean;
  readonly at: number;
}

const WORDMARK: ReadonlyArray<readonly [text: string, soft: boolean]> = [
  ['ACERTO', false],
  ['CRÍTICO', true],
];

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconD20],
  styleUrl: './logo.scss',
  host: { '[class.is-compact]': 'compact()' },
  template: `
    <a
      class="logo"
      routerLink="/"
      [class.is-excited]="excited()"
      [attr.aria-label]="name + ' — ir para a página inicial'"
      (pointerenter)="excited.set(true)"
      (pointerleave)="excited.set(false)"
      (focus)="excited.set(true)"
      (blur)="excited.set(false)"
    >
      <app-icon-d20
        class="logo__mark"
        variant="solid"
        tone="brand"
        [class.is-excited]="excited()"
        [size]="size()"
        label=""
      />

      <span class="logo__word" aria-hidden="true">
        @for (glyph of glyphs(); track glyph.at) {
          <span
            class="logo__ch"
            [class.logo__ch--soft]="glyph.soft"
            [class.logo__ch--gap]="glyph.gap"
            >{{ glyph.char }}</span
          >
        }
      </span>
    </a>
  `,
})
export class Logo {
  readonly size = input(38);
  readonly compact = input(false);

  protected readonly name = WORDMARK.map(([text]) => text).join(' ');
  protected readonly excited = signal(false);

  protected readonly glyphs = computed<readonly Glyph[]>(() => {
    const out: Glyph[] = [];
    let at = 0;

    for (const [text, soft] of WORDMARK) {
      if (out.length) {
        out.push({ char: '', soft, gap: true, at: at++ });
      }
      for (const char of text) {
        out.push({ char, soft, gap: false, at: at++ });
      }
    }

    return out;
  });
}

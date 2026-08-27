import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type D20Variant = 'unboxing' | 'solid' | 'express';

export type D20Tone = 'current' | 'brand';

const BRAND_GRADIENT = 'ac-d20-grad';

/**
 * Icone da marca: o D20 de Entrega.
 *
 * Herda a cor via `currentColor` e o tamanho via o input `size`.
 */
@Component({
  selector: 'app-icon-d20',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './icon-d20.scss',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 100 100"
      fill="none"
      [attr.stroke]="paint()"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
    >
      @if (tone() === 'brand') {
        <defs>
          <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2="1" y2="1">
            <stop class="d20-stop-a" offset="0" />
            <stop class="d20-stop-b" offset="1" />
          </linearGradient>
        </defs>
      }

      @switch (variant()) {
        @case ('unboxing') {
          <path
            class="d20-lid"
            d="M44.76 11.46 L39.69 15.95 Q34.45 20.59 41.45 20.59 L58.55 20.59
               Q65.55 20.59 60.31 15.95 L55.24 11.46 Q50 6.82 44.76 11.46 Z"
          />
          <path
            d="M44.8 32 Q50 29 55.2 32 L73.38 42.5 Q78.58 45.5 78.58 51.5 L78.58 72.5
               Q78.58 78.5 73.38 81.5 L55.2 92 Q50 95 44.8 92 L26.62 81.5
               Q21.42 78.5 21.42 72.5 L21.42 51.5 Q21.42 45.5 26.62 42.5 Z"
          />
          <path
            d="M47 46.8 L35.33 67 Q32.33 72.2 38.33 72.2 L61.67 72.2
               Q67.67 72.2 64.67 67 L53 46.8 Q50 41.6 47 46.8 Z"
          />
          <path d="M50 44.2 L50 30.5 M50 44.2 L77.28 46.25 M50 44.2 L22.72 46.25" />
          <path d="M34.58 70.9 L22.72 46.25 M34.58 70.9 L22.72 77.75 M34.58 70.9 L50 93.5" />
          <path d="M65.42 70.9 L77.28 46.25 M65.42 70.9 L77.28 77.75 M65.42 70.9 L50 93.5" />
          @if (sparkles()) {
            <g class="d20-sparks" opacity=".7" [attr.stroke-width]="strokeWidth() * 0.8">
              <path d="M26 27.8 V34.2 M22.8 31 H29.2" />
              <path d="M74.5 27.6 V32.4 M72.1 30 H76.9" />
            </g>
          }
        }
        @case ('solid') {
          <path
            d="M46.25 30.54 L31.27 56.49 Q27.52 62.98 35.02 62.98 L64.98 62.98
               Q72.48 62.98 68.73 56.49 L53.75 30.54 Q50 24.04 46.25 30.54 Z"
            [attr.fill]="paint()"
            fill-opacity=".16"
          />
          <path
            d="M43.51 11.75 Q50 8 56.49 11.75 L79.88 25.25 Q86.37 29 86.37 36.5 L86.37 63.5
               Q86.37 71 79.88 74.75 L56.49 88.25 Q50 92 43.51 88.25 L20.12 74.75
               Q13.63 71 13.63 63.5 L13.63 36.5 Q13.63 29 20.12 25.25 Z"
          />
          <path d="M50 27.29 L50 9.88 M50 27.29 L84.75 29.94 M50 27.29 L15.25 29.94" />
          <path d="M30.33 61.36 L15.25 29.94 M30.33 61.36 L15.25 70.06 M30.33 61.36 L50 90.13" />
          <path d="M69.67 61.36 L84.75 29.94 M69.67 61.36 L84.75 70.06 M69.67 61.36 L50 90.13" />
        }
        @case ('express') {
          <g opacity=".55">
            <path d="M5 38 H19" />
            <path d="M11 50 H19" />
            <path d="M5 62 H19" />
          </g>
          <path
            d="M54.75 33.38 L41.98 55.5 Q38.73 61.13 45.23 61.13 L70.77 61.13
               Q77.27 61.13 74.02 55.5 L61.25 33.38 Q58 27.75 54.75 33.38 Z"
            [attr.fill]="paint()"
            fill-opacity=".12"
          />
          <path
            d="M52.37 17.25 Q58 14 63.63 17.25 L83.55 28.75 Q89.18 32 89.18 38.5 L89.18 61.5
               Q89.18 68 83.55 71.25 L63.63 82.75 Q58 86 52.37 82.75 L32.45 71.25
               Q26.82 68 26.82 61.5 L26.82 38.5 Q26.82 32 32.45 28.75 Z"
          />
          <path d="M58 30.57 L58 15.63 M58 30.57 L87.77 32.81 M58 30.57 L28.23 32.81" />
          <path d="M41.17 59.72 L28.23 32.81 M41.17 59.72 L28.23 67.19 M41.17 59.72 L58 84.38" />
          <path d="M74.83 59.72 L87.77 32.81 M74.83 59.72 L87.77 67.19 M74.83 59.72 L58 84.38" />
        }
      }
    </svg>
  `,
})
export class IconD20 {
  readonly variant = input<D20Variant>('solid');
  readonly tone = input<D20Tone>('current');
  readonly size = input(40);
  readonly label = input('D20 de Entrega');
  readonly sparkles = input(true);

  readonly weight = input<number | null>(null);

  readonly strokeWidth = computed(
    () => this.weight() ?? Math.min(8.5, Math.max(5, 200 / this.size())),
  );

  /** Id fixo: presume-se uma unica instancia `brand` por pagina (a marca). */
  protected readonly gradientId = BRAND_GRADIENT;

  protected readonly paint = computed(() =>
    this.tone() === 'brand' ? `url(#${BRAND_GRADIENT})` : 'currentColor',
  );
}

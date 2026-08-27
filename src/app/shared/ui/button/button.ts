import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconD20 } from '../icon-d20/icon-d20';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Botao do design system.
 *
 * Usa seletor de atributo sobre o <button> nativo de proposito: assim o
 * elemento continua sendo um botao de verdade: type, form, disabled, foco e
 * semantica de leitor de tela vem de graca, sem reimplementacao.
 *
 * A assinatura visual e a inversao: como a paleta e so preto/branco/cinza,
 * a interacao acontece em contraste, nao em cor.
 *
 * @example
 * <button appButton variant="primary" size="lg">Adicionar ao carrinho</button>
 */
@Component({
  selector: 'button[appButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconD20],
  styleUrl: './button.scss',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-block]': 'block()',
    '[attr.aria-busy]': 'loading() || null',
    '[disabled]': 'disabled() || loading() || null',
  },
  template: `
    <span class="btn__wipe" aria-hidden="true"></span>

    <span class="btn__content">
      @if (loading()) {
        <span class="btn__spinner" aria-hidden="true">
          <app-icon-d20 variant="solid" [size]="spinnerSize()" />
        </span>
        <span class="sr-only">{{ loadingLabel() }}</span>
      }
      <ng-content />
    </span>
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false);
  readonly disabled = input(false);
  readonly loading = input(false);

  readonly loadingLabel = input('Carregando');

  readonly spinnerSize = computed(() => (this.size() === 'sm' ? 14 : 16));
}

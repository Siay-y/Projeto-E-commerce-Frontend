import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Botao quadrado para icones. Como o <button appButton>, usa seletor de
 * atributo para preservar a semantica nativa.
 *
 * Sempre precisa de um rotulo acessivel: um icone sozinho nao tem nome.
 *
 * @example
 * <button appIconButton aria-label="Abrir carrinho"><app-icon name="bag" /></button>
 */
@Component({
  selector: 'button[appIconButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './icon-button.scss',
  template: `
    <span class="ib__veil" aria-hidden="true"></span>
    <span class="ib__slot"><ng-content /></span>
  `,
  host: {
    '[attr.data-size]': 'size()',
    '[disabled]': 'disabled() || null',
  },
})
export class IconButton {
  readonly size = input<'sm' | 'md'>('md');
  readonly disabled = input(false);
}

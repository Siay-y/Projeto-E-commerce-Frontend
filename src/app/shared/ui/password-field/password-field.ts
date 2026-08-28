import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';

import { PasswordContext, strengthOf } from '../../../core/auth/password';
import { Icon } from '../icon/icon';
import { TextField } from '../text-field/text-field';

@Component({
  selector: 'app-password-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, TextField],
  styleUrl: './password-field.scss',
  host: { '(keydown)': 'readCaps($event)', '(focusout)': 'caps.set(false)' },
  template: `
    <app-text-field
      [(value)]="value"
      [label]="label()"
      [type]="shown() ? 'text' : 'password'"
      [name]="name()"
      [autocomplete]="autocomplete()"
      [placeholder]="placeholder()"
      [maxlength]="maxlength()"
      [enterkeyhint]="enterkeyhint()"
      icon="lock"
      [hint]="hint()"
      [error]="error()"
      [disabled]="disabled()"
      (left)="left.emit()"
    >
      <button
        slot="trailing"
        class="pf__reveal"
        type="button"
        [attr.aria-label]="shown() ? 'Ocultar senha' : 'Mostrar senha'"
        [attr.aria-pressed]="shown()"
        (click)="shown.set(!shown())"
      >
        <app-icon [name]="shown() ? 'eye-off' : 'eye'" [size]="18" />
      </button>
    </app-text-field>

    @if (caps()) {
      <p class="pf__caps" role="status">
        <app-icon name="alert" [size]="14" aria-hidden="true" />
        Caps Lock está ligado.
      </p>
    }

    @if (meter() && value().length > 0) {
      <div class="pf__meter">
        <div class="pf__bars" aria-hidden="true">
          @for (step of STEPS; track step) {
            <span class="pf__bar" [attr.data-on]="strength().score >= step || null"></span>
          }
        </div>
        <span class="pf__score">{{ strength().label }}</span>
      </div>
    }
  `,
})
export class PasswordField {
  readonly value = model('');

  readonly label = input('Senha');
  readonly name = input('password');
  readonly autocomplete = input('current-password');
  readonly placeholder = input('');
  readonly enterkeyhint = input('');
  readonly maxlength = input(0);
  readonly hint = input('');
  readonly error = input<string | null>(null);
  readonly disabled = input(false);

  readonly meter = input(false);
  readonly context = input<PasswordContext>({});

  readonly left = output<void>();

  protected readonly STEPS = [1, 2, 3, 4];

  protected readonly shown = signal(false);
  protected readonly caps = signal(false);

  protected readonly strength = computed(() => strengthOf(this.value(), this.context()));

  protected readCaps(event: KeyboardEvent): void {
    this.caps.set(event.getModifierState?.('CapsLock') ?? false);
  }
}

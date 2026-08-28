import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

import { Icon, IconName } from '../icon/icon';

let seq = 0;

@Component({
  selector: 'app-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  styleUrl: './text-field.scss',
  host: { '[attr.data-invalid]': 'invalid() || null' },
  template: `
    <label class="tf__label" [attr.for]="inputId">
      {{ label() }}
      @if (optional()) {
        <span class="tf__optional">opcional</span>
      }
    </label>

    <div class="tf__box">
      @if (icon(); as name) {
        <span class="tf__icon" aria-hidden="true">
          <app-icon [name]="name" [size]="17" />
        </span>
      }

      <input
        class="tf__input"
        [id]="inputId"
        [type]="type()"
        [value]="value()"
        [attr.name]="name()"
        [attr.autocomplete]="autocomplete()"
        [attr.inputmode]="inputmode() || null"
        [attr.placeholder]="placeholder() || null"
        [attr.maxlength]="maxlength() || null"
        [attr.enterkeyhint]="enterkeyhint() || null"
        [attr.aria-invalid]="invalid() || null"
        [attr.aria-describedby]="describedBy()"
        [disabled]="disabled()"
        (input)="write($event)"
        (blur)="left.emit()"
      />

      <ng-content select="[slot=trailing]" />
    </div>

    @if (invalid()) {
      <p class="tf__error" [id]="errorId">
        <app-icon name="alert" [size]="14" aria-hidden="true" />
        {{ error() }}
      </p>
    } @else if (hint()) {
      <p class="tf__hint" [id]="hintId">{{ hint() }}</p>
    }
  `,
})
export class TextField {
  readonly value = model('');

  readonly label = input.required<string>();
  readonly type = input('text');
  readonly name = input('');
  readonly autocomplete = input('off');
  readonly inputmode = input('');
  readonly placeholder = input('');
  readonly enterkeyhint = input('');
  readonly maxlength = input(0);
  readonly icon = input<IconName | null>(null);
  readonly hint = input('');
  readonly error = input<string | null>(null);
  readonly optional = input(false);
  readonly disabled = input(false);

  readonly left = output<void>();

  private readonly uid = `tf-${seq++}`;

  protected readonly inputId = `${this.uid}-input`;
  protected readonly errorId = `${this.uid}-error`;
  protected readonly hintId = `${this.uid}-hint`;

  protected readonly invalid = computed(() => Boolean(this.error()));

  protected readonly describedBy = computed(() => {
    if (this.invalid()) return this.errorId;

    return this.hint() ? this.hintId : null;
  });

  protected write(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}

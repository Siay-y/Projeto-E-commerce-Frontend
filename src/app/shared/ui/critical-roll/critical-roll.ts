import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { D20_SIDES } from '../../../core/roll/roll';
import { RollStore } from '../../../core/roll/roll-store';
import { Button } from '../button/button';
import { IconD20 } from '../icon-d20/icon-d20';

const FACE_MS = 70;

@Component({
  selector: 'app-critical-roll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IconD20],
  styleUrl: './critical-roll.scss',
  host: {
    '[attr.data-state]': 'state()',
  },
  template: `
    <div class="cd__face" aria-hidden="true">
      <span class="cd__die">
        <app-icon-d20 variant="solid" tone="brand" [size]="64" label="" />
      </span>
      @if (shown() !== null) {
        <span class="cd__value">{{ shown() }}</span>
      }
    </div>

    @if (roll.result(); as result) {
      <div class="cd__won" role="status">
        <p class="cd__headline">{{ result.reward.headline }}</p>
        <p class="cd__detail">{{ result.reward.detail }}</p>
        <p class="cd__seal">Você tirou {{ result.value }} de {{ sides }}</p>
      </div>
    } @else {
      <div class="cd__pitch">
        <p class="cd__headline">Rolagem Crítica</p>
        <p class="cd__detail">
          Uma rolagem por pedido, e toda rolagem premia. O 20 natural vale
          brinde e o broche da guilda.
        </p>
      </div>

      <button
        appButton
        type="button"
        variant="accent"
        [block]="true"
        [loading]="roll.rolling()"
        loadingLabel="Rolando o dado"
        (click)="start()"
      >
        {{ roll.rolling() ? 'Rolando' : 'Rolar o d20' }}
      </button>

      @if (roll.error()) {
        <p class="cd__error" role="alert">
          Não deu para rolar agora. Tente de novo em instantes.
        </p>
      }
    }
  `,
})
export class CriticalRoll {
  protected readonly roll = inject(RollStore);

  protected readonly sides = D20_SIDES;

  private readonly face = signal<number | null>(null);

  protected readonly shown = computed(() =>
    this.roll.rolling() ? this.face() : (this.roll.result()?.value ?? null),
  );

  protected readonly state = computed(() => {
    if (this.roll.rolling()) return 'rolling';
    return this.roll.reward()?.tier ?? 'idle';
  });

  private ticker: ReturnType<typeof setInterval> | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => void this.roll.load());

    destroyRef.onDestroy(() => this.stopTicker());
  }

  protected async start(): Promise<void> {
    if (this.roll.rolling() || this.roll.result()) return;

    this.startTicker();
    await this.roll.roll();
    this.stopTicker();
  }

  private startTicker(): void {
    this.stopTicker();
    this.ticker = setInterval(
      () => this.face.set(Math.floor(Math.random() * D20_SIDES) + 1),
      FACE_MS,
    );
  }

  private stopTicker(): void {
    if (this.ticker === null) return;

    clearInterval(this.ticker);
    this.ticker = null;
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { AuthStore } from '../../../core/auth/auth-store';
import { D20_SIDES } from '../../../core/roll/roll';
import { RollStore } from '../../../core/roll/roll-store';
import { PATHS } from '../../../core/routing/paths';
import { Button } from '../button/button';
import { ButtonLink } from '../button/button-link';
import { IconD20 } from '../icon-d20/icon-d20';

const FACE_MS = 70;

@Component({
  selector: 'app-critical-roll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Button, ButtonLink, IconD20],
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
          @if (mine()) {
            Uma rolagem por pedido, e toda rolagem premia. O 20 natural vale
            brinde e o broche da guilda.
          } @else {
            Toda rolagem premia, e o 20 natural vale brinde e o broche da
            guilda. O resultado fica guardado na sua conta.
          }
        </p>
      </div>

      @if (mine()) {
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
      } @else if (settled()) {
        <a
          appButtonLink
          variant="accent"
          [block]="true"
          [routerLink]="PATHS.register"
          [queryParams]="{ destino: PATHS.cart }"
        >
          Criar conta e rolar
        </a>

        <p class="cd__note">
          Já tem conta?
          <a [routerLink]="PATHS.login" [queryParams]="{ destino: PATHS.cart }">
            Entrar
          </a>
        </p>
      }
    }
  `,
})
export class CriticalRoll {
  protected readonly roll = inject(RollStore);
  private readonly auth = inject(AuthStore);

  protected readonly PATHS = PATHS;
  protected readonly sides = D20_SIDES;

  protected readonly mine = computed(() => this.auth.isLoggedIn());

  protected readonly settled = computed(() => this.auth.status() !== 'desconhecido');

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

    afterNextRender(async () => {
      await this.auth.restore();
      if (this.auth.isLoggedIn()) void this.roll.load();
    });

    destroyRef.onDestroy(() => this.stopTicker());
  }

  protected async start(): Promise<void> {
    if (!this.mine() || this.roll.rolling() || this.roll.result()) return;

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

import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Roll, rewardFor } from './roll';

const ENDPOINT = '/api/rolagem';

const MIN_ROLL_MS = 1400;

interface RollResponse {
  readonly value: number | null;
}

@Injectable({ providedIn: 'root' })
export class RollStore {
  private readonly http = inject(HttpClient);

  private readonly value = signal<number | null>(null);
  private readonly busy = signal(false);
  private readonly failed = signal(false);

  readonly rolling = this.busy.asReadonly();
  readonly error = this.failed.asReadonly();

  readonly result = computed<Roll | null>(() => {
    const value = this.value();
    return value === null ? null : { value, reward: rewardFor(value) };
  });

  readonly reward = computed(() => this.result()?.reward ?? null);

  async load(): Promise<void> {
    if (this.value() !== null) return;

    try {
      const answer = await firstValueFrom(this.http.get<RollResponse>(ENDPOINT));
      this.value.set(answer.value);
    } catch {}
  }

  async roll(): Promise<void> {
    if (this.busy() || this.value() !== null) return;

    this.busy.set(true);
    this.failed.set(false);

    try {
      const [answer] = await Promise.all([
        firstValueFrom(this.http.post<RollResponse>(ENDPOINT, {})),
        new Promise((resolve) => setTimeout(resolve, this.floor())),
      ]);

      this.value.set(answer.value);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  private floor(): number {
    const reduced =
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;

    return reduced ? 0 : MIN_ROLL_MS;
  }
}

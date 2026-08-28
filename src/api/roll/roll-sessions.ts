import { randomUUID } from 'node:crypto';

export const ROLL_TTL_MS = 24 * 60 * 60 * 1000;

export interface RollSession {
  readonly value: number;
  readonly at: number;
}

export interface RollSessions {
  find(id: string | null): RollSession | undefined;
  open(value: number): string;
}

export class MemoryRollSessions implements RollSessions {
  private readonly sessions = new Map<string, RollSession>();

  constructor(private readonly ttl = ROLL_TTL_MS) {}

  find(id: string | null): RollSession | undefined {
    this.sweep();

    return id ? this.sessions.get(id) : undefined;
  }

  open(value: number): string {
    this.sweep();

    const id = randomUUID();

    this.sessions.set(id, { value, at: Date.now() });

    return id;
  }

  private sweep(): void {
    const cutoff = Date.now() - this.ttl;

    for (const [id, session] of this.sessions) {
      if (session.at < cutoff) this.sessions.delete(id);
    }
  }
}

import { Router } from 'express';
import { randomInt } from 'node:crypto';

import { D20_SIDES } from '../../app/core/roll/roll';
import { readCookie } from '../cookies';
import { MemoryRollSessions, ROLL_TTL_MS, RollSessions } from './roll-sessions';

const COOKIE = 'ac-roll';

export function rollRoutes(sessions: RollSessions = new MemoryRollSessions()): Router {
  const routes = Router();

  routes.get('/rolagem', (request, response) => {
    const session = sessions.find(readCookie(request, COOKIE));

    response.json({ value: session?.value ?? null });
  });

  routes.post('/rolagem', (request, response) => {
    const existing = sessions.find(readCookie(request, COOKIE));

    if (existing) {
      response.json({ value: existing.value });
      return;
    }

    const value = randomInt(1, D20_SIDES + 1);
    const id = sessions.open(value);

    response.cookie(COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env['NODE_ENV'] === 'production',
      maxAge: ROLL_TTL_MS,
      path: '/',
    });

    response.json({ value });
  });

  return routes;
}

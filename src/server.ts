import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { randomInt, randomUUID } from 'node:crypto';
import { join } from 'node:path';

import { PRODUCTS } from './app/core/catalog/catalog-data';
import { availabilityOf, packedOf } from './app/core/catalog/product';
import { D20_SIDES } from './app/core/roll/roll';
import { Parcel, quoteFor } from './app/core/shipping/quote';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// -----------------------------------------------------------------------------
// Rolagem Crítica
// -----------------------------------------------------------------------------
const ROLL_COOKIE = 'ac-roll';
const ROLL_TTL = 24 * 60 * 60 * 1000;

interface RollSession {
  readonly value: number;
  readonly at: number;
}

const rolls = new Map<string, RollSession>();

function sweepRolls(): void {
  const cutoff = Date.now() - ROLL_TTL;
  for (const [id, session] of rolls) {
    if (session.at < cutoff) rolls.delete(id);
  }
}

function readRollId(req: express.Request): string | null {
  const header = req.headers.cookie;
  if (!header) return null;

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === ROLL_COOKIE) return decodeURIComponent(rest.join('='));
  }

  return null;
}

app.get('/api/rolagem', (req, res) => {
  sweepRolls();

  const id = readRollId(req);
  const session = id ? rolls.get(id) : undefined;

  res.json({ value: session?.value ?? null });
});

app.post('/api/rolagem', (req, res) => {
  sweepRolls();

  const id = readRollId(req);
  const existing = id ? rolls.get(id) : undefined;

  if (existing) {
    res.json({ value: existing.value });
    return;
  }

  const fresh = randomUUID();

  const value = randomInt(1, D20_SIDES + 1);

  rolls.set(fresh, { value, at: Date.now() });

  res.cookie(ROLL_COOKIE, fresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env['NODE_ENV'] === 'production',
    maxAge: ROLL_TTL,
    path: '/',
  });

  res.json({ value });
});

// -----------------------------------------------------------------------------
// Frete
// -----------------------------------------------------------------------------
const MAX_ITEMS = 40;

interface QuoteRequestItem {
  readonly id?: unknown;
  readonly optionId?: unknown;
  readonly quantity?: unknown;
}

app.post('/api/frete', express.json({ limit: '8kb' }), (req, res) => {
  const cep = typeof req.body?.cep === 'string' ? req.body.cep : '';
  const asked: QuoteRequestItem[] = Array.isArray(req.body?.items) ? req.body.items : [];

  if (asked.length === 0 || asked.length > MAX_ITEMS) {
    res.status(400).json({ error: 'sem-itens' });
    return;
  }

  const parcels: Parcel[] = [];

  for (const item of asked) {
    const product = PRODUCTS.find((candidate) => candidate.id === item.id);
    if (!product) {
      res.status(400).json({ error: 'item-desconhecido' });
      return;
    }

    const option = product.options?.values.find((value) => value.id === item.optionId);
    const availability = availabilityOf(product, option);
    const quantity = Math.min(10, Math.max(1, Math.trunc(Number(item.quantity) || 1)));

    parcels.push({
      packed: packedOf(product, option),
      quantity,
      readyInDays: availability.kind === 'made-to-order' ? availability.days : 0,
    });
  }

  const quote = quoteFor(cep, parcels);

  if ('error' in quote) {
    res.status(quote.error === 'cep-invalido' ? 400 : 422).json(quote);
    return;
  }

  res.json(quote);
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  res.setHeader('Vary', 'Cookie');

  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

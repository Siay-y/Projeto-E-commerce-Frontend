import { Router, json } from 'express';

import { quoteFor } from '../../app/core/shipping/quote';
import { parcelsFrom } from './parcels';

const UNPROCESSABLE = 422;
const BAD_REQUEST = 400;

export function shippingRoutes(): Router {
  const routes = Router();

  routes.post('/frete', json({ limit: '8kb' }), (request, response) => {
    const body = request.body as { cep?: unknown; items?: unknown } | undefined;

    const cep = typeof body?.cep === 'string' ? body.cep : '';
    const items = Array.isArray(body?.items) ? body.items : [];

    const parcels = parcelsFrom(items);

    if (!parcels.ok) {
      response.status(BAD_REQUEST).json({ error: parcels.error });
      return;
    }

    const quote = quoteFor(cep, parcels.parcels);

    if ('error' in quote) {
      response
        .status(quote.error === 'cep-invalido' ? BAD_REQUEST : UNPROCESSABLE)
        .json(quote);
      return;
    }

    response.json(quote);
  });

  return routes;
}

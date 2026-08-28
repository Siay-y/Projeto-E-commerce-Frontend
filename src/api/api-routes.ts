import { Router } from 'express';

import { rollRoutes } from './roll/roll-routes';
import { shippingRoutes } from './shipping/shipping-routes';

export function apiRoutes(): Router {
  const api = Router();

  api.use(rollRoutes());
  api.use(shippingRoutes());

  return api;
}

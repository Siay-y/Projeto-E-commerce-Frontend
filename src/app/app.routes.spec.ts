import { Route, Routes } from '@angular/router';

import { routes } from './app.routes';
import { requireAuth } from './core/auth/auth-guard';
import { PATHS } from './core/routing/paths';

function flatten(config: Routes, prefix = ''): (Route & { full: string })[] {
  const out: (Route & { full: string })[] = [];

  for (const route of config) {
    if (route.path === undefined) continue;

    const full = route.path === '' ? prefix || '/' : `${prefix}/${route.path}`;

    out.push({ ...route, full });

    if (route.children) {
      out.push(...flatten(route.children, full === '/' ? '' : full));
    }
  }

  return out;
}

function guarded(full: string): boolean {
  return flatten(routes).some(
    (route) =>
      (route.full === full || full.startsWith(`${route.full}/`)) &&
      (route.canActivate ?? []).includes(requireAuth),
  );
}

describe('árvore de rotas', () => {
  it('exige conta no checkout', () => {
    expect(guarded(PATHS.checkout)).toBe(true);
  });

  it('protege tudo que fica sob a conta', () => {
    for (const path of [PATHS.account, PATHS.orders, PATHS.addresses, PATHS.security]) {
      expect(guarded(path), `desprotegido: ${path}`).toBe(true);
    }
  });

  it('deixa comprar sem conta até o checkout', () => {
    for (const path of [
      '/',
      PATHS.animes,
      PATHS.cart,
      PATHS.category('camisas').join('/'),
      PATHS.product('qualquer').join('/'),
    ]) {
      expect(guarded(path), `travado sem precisar: ${path}`).toBe(false);
    }
  });

  it('não deixa nenhuma rota sem componente', () => {
    for (const route of flatten(routes)) {
      const has = Boolean(route.component ?? route.loadComponent ?? route.children);
      expect(has, `rota vazia: ${route.full}`).toBe(true);
    }
  });
});

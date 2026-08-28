import { Routes } from '@angular/router';

import { requireAnonymous, requireAuth } from './core/auth/auth-guard';
import { animeTitle, categoryTitle, productTitle } from './core/routing/titles';
import { AuthLayout } from './layout/auth-layout';
import { StoreLayout } from './layout/store-layout';

const CONTENT_PAGES: readonly (readonly [string, string])[] = [
  ['sobre', 'Sobre a loja'],
  ['loot-box', 'Loot Box'],
  ['rastrear', 'Rastrear pedido'],
  ['trocas', 'Trocas e devoluções'],
  ['entrega', 'Prazos e frete'],
  ['contato', 'Fale conosco'],
  ['termos', 'Termos de uso'],
  ['privacidade', 'Política de privacidade'],
];

const ACCOUNT_PAGES: readonly (readonly [string, string])[] = [
  ['pedidos', 'Pedidos'],
  ['enderecos', 'Endereços'],
  ['seguranca', 'Segurança'],
];

const placeholder = () =>
  import('./features/placeholder/placeholder-page').then((m) => m.PlaceholderPage);

const AUTH_PAGES = [
  [
    'entrar',
    'Entrar',
    () => import('./features/auth/login-page').then((m) => m.LoginPage),
  ],
  [
    'cadastro',
    'Criar conta',
    () => import('./features/auth/register-page').then((m) => m.RegisterPage),
  ],
] as const;

export const routes: Routes = [
  ...AUTH_PAGES.map(([path, title, page]) => ({
    path,
    component: AuthLayout,
    children: [{ path: '', title, canActivate: [requireAnonymous], loadComponent: page }],
  })),

  {
    path: 'recuperar-senha',
    component: AuthLayout,
    children: [
      {
        path: '',
        title: 'Recuperar senha',
        loadComponent: placeholder,
        data: { heading: 'Recuperar senha' },
      },
    ],
  },

  {
    path: '',
    component: StoreLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Camisas, action figures e réplicas de anime',
        loadComponent: placeholder,
        data: { heading: 'Início' },
      },

      {
        path: 'animes',
        title: 'Animes',
        loadComponent: () =>
          import('./features/animes/animes-page').then((m) => m.AnimesPage),
      },
      {
        path: 'animes/:anime',
        title: animeTitle,
        loadComponent: placeholder,
        data: { heading: 'Anime' },
      },

      {
        path: 'categorias/:category',
        title: categoryTitle,
        loadComponent: placeholder,
        data: { heading: 'Departamento' },
      },

      {
        path: 'produto/:slug',
        title: productTitle,
        loadComponent: () =>
          import('./features/product/product-page').then((m) => m.ProductPage),
      },

      {
        path: 'carrinho',
        title: 'Seu carrinho',
        loadComponent: () => import('./features/cart/cart-page').then((m) => m.CartPage),
      },
      {
        path: 'checkout',
        title: 'Checkout',
        canActivate: [requireAuth],
        loadComponent: placeholder,
        data: { heading: 'Checkout' },
      },

      {
        path: 'conta',
        canActivate: [requireAuth],
        children: [
          {
            path: '',
            pathMatch: 'full',
            title: 'Sua conta',
            loadComponent: () =>
              import('./features/auth/account-page').then((m) => m.AccountPage),
          },
          ...ACCOUNT_PAGES.map(([path, heading]) => ({
            path,
            title: heading,
            loadComponent: placeholder,
            data: { heading },
          })),
        ],
      },

      ...CONTENT_PAGES.map(([path, heading]) => ({
        path,
        title: heading,
        loadComponent: placeholder,
        data: { heading },
      })),

      {
        path: '**',
        title: 'Página não encontrada',
        loadComponent: () =>
          import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
      },
    ],
  },
];

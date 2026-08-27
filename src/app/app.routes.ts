import { Routes } from '@angular/router';

import { CATEGORIES } from './core/catalog/category';
import { AnimesPage } from './features/animes/animes-page';
import { CartPage } from './features/cart/cart-page';
import { NotFoundPage } from './features/not-found/not-found-page';
import { PlaceholderPage } from './features/placeholder/placeholder-page';
import { ProductPage } from './features/product/product-page';
import { FOOTER_PAGES } from './layout/footer-links';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: PlaceholderPage, data: { heading: 'Início' } },

  { path: 'animes', component: AnimesPage },
  { path: 'animes/:anime', component: PlaceholderPage, data: { heading: 'Anime' } },

  ...CATEGORIES.map((category) => ({
    path: category.slug,
    component: PlaceholderPage,
    data: { heading: category.label, category: category.slug },
  })),

  { path: 'produto/:slug', component: ProductPage },

  { path: 'carrinho', component: CartPage },
  { path: 'checkout', component: PlaceholderPage, data: { heading: 'Checkout' } },

  { path: 'loot-box', component: PlaceholderPage, data: { heading: 'Loot Box' } },
  { path: 'sobre', component: PlaceholderPage, data: { heading: 'Sobre a loja' } },

  ...FOOTER_PAGES.map((page) => ({
    path: page.path.slice(1),
    component: PlaceholderPage,
    data: { heading: page.label },
  })),

  { path: 'conta', component: PlaceholderPage, data: { heading: 'Sua conta' } },
  { path: '**', component: NotFoundPage },
];

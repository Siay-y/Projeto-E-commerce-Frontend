import { Routes } from '@angular/router';

import { PlaceholderPage } from './features/placeholder/placeholder-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: PlaceholderPage, data: { heading: 'Início' } },
  { path: 'catalogo', component: PlaceholderPage, data: { heading: 'Catálogo' } },
  { path: 'universos', component: PlaceholderPage, data: { heading: 'Universos' } },
  { path: 'loot-box', component: PlaceholderPage, data: { heading: 'Loot Box' } },
  { path: 'sobre', component: PlaceholderPage, data: { heading: 'Sobre' } },
  { path: 'conta', component: PlaceholderPage, data: { heading: 'Sua conta' } },
  { path: '**', redirectTo: '' },
];

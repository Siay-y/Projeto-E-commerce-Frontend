import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';

import { CatalogStore } from '../catalog/catalog-store';
import { CategorySlug, categoryLabel } from '../catalog/category';

export const productTitle: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const slug = route.paramMap.get('slug') ?? '';

  return inject(CatalogStore).bySlug(slug)?.title ?? 'Produto';
};

export const categoryTitle: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const slug = route.paramMap.get('category') ?? '';

  return categoryLabel(slug as CategorySlug);
};

export const animeTitle: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const slug = route.paramMap.get('anime') ?? '';

  return inject(CatalogStore).animeBySlug(slug)?.name ?? 'Anime';
};

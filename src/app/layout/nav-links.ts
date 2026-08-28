import { CATEGORIES } from '../core/catalog/category';
import { PATHS } from '../core/routing/paths';

export interface NavLink {
  readonly path: string;
  readonly label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { path: PATHS.animes, label: 'Animes' },
  ...CATEGORIES.map((category) => ({
    path: PATHS.category(category.slug).join('/'),
    label: category.label,
  })),
];

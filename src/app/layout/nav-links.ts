import { CATEGORIES } from '../core/catalog/category';

export interface NavLink {
  readonly path: string;
  readonly label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { path: '/animes', label: 'Animes' },
  ...CATEGORIES.map((category) => ({
    path: `/${category.slug}`,
    label: category.label,
  })),
];

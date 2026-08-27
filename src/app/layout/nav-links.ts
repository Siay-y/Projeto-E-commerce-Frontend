export interface NavLink {
  readonly path: string;
  readonly label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { path: '/catalogo', label: 'Catálogo' },
  { path: '/universos', label: 'Universos' },
  { path: '/loot-box', label: 'Loot Box' },
  { path: '/sobre', label: 'Sobre' },
];

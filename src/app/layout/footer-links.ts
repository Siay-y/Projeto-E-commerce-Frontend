import { CATEGORIES } from '../core/catalog/category';

export interface FooterLink {
  readonly path: string;
  readonly label: string;
}

export interface FooterSection {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

export const FOOTER_PAGES: readonly FooterLink[] = [
  { path: '/rastrear', label: 'Rastrear pedido' },
  { path: '/trocas', label: 'Trocas e devoluções' },
  { path: '/entrega', label: 'Prazos e frete' },
  { path: '/contato', label: 'Fale conosco' },
  { path: '/termos', label: 'Termos de uso' },
  { path: '/privacidade', label: 'Política de privacidade' },
];

function page(path: string): FooterLink {
  const found = FOOTER_PAGES.find((candidate) => candidate.path === path);
  if (!found) throw new Error(`Pagina de rodape desconhecida: ${path}`);

  return found;
}

export const FOOTER_SECTIONS: readonly FooterSection[] = [
  {
    title: 'Comprar',
    links: [
      { path: '/animes', label: 'Animes' },
      ...CATEGORIES.map((category) => ({
        path: `/${category.slug}`,
        label: category.label,
      })),
    ],
  },
  {
    title: 'Atendimento',
    links: [page('/rastrear'), page('/trocas'), page('/entrega'), page('/contato')],
  },
  {
    title: 'A loja',
    links: [
      { path: '/sobre', label: 'Sobre a loja' },
      { path: '/loot-box', label: 'Loot Box' },
    ],
  },
];

export const LEGAL_LINKS: readonly FooterLink[] = [
  page('/termos'),
  page('/privacidade'),
];

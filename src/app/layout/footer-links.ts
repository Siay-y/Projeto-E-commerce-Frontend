import { CATEGORIES } from '../core/catalog/category';
import { PATHS } from '../core/routing/paths';

export interface FooterLink {
  readonly path: string;
  readonly label: string;
}

export interface FooterSection {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

export const FOOTER_PAGES: readonly FooterLink[] = [
  { path: PATHS.tracking, label: 'Rastrear pedido' },
  { path: PATHS.returns, label: 'Trocas e devoluções' },
  { path: PATHS.delivery, label: 'Prazos e frete' },
  { path: PATHS.contact, label: 'Fale conosco' },
  { path: PATHS.terms, label: 'Termos de uso' },
  { path: PATHS.privacy, label: 'Política de privacidade' },
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
      { path: PATHS.animes, label: 'Animes' },
      ...CATEGORIES.map((category) => ({
        path: PATHS.category(category.slug).join('/'),
        label: category.label,
      })),
    ],
  },
  {
    title: 'Atendimento',
    links: [
      page(PATHS.tracking),
      page(PATHS.returns),
      page(PATHS.delivery),
      page(PATHS.contact),
    ],
  },
  {
    title: 'A loja',
    links: [
      { path: PATHS.about, label: 'Sobre a loja' },
      { path: PATHS.lootBox, label: 'Loot Box' },
      page(PATHS.terms),
      page(PATHS.privacy),
    ],
  },
];

export const LEGAL_LINKS: readonly FooterLink[] = [
  page(PATHS.terms),
  page(PATHS.privacy),
];

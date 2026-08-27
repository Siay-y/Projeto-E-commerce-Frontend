export type CategorySlug =
  | 'camisas'
  | 'acessorios'
  | 'action-figures'
  | 'cosplay'
  | 'replicas';

export interface Category {
  readonly slug: CategorySlug;
  readonly label: string;
}

export const CATEGORIES: readonly Category[] = [
  { slug: 'camisas', label: 'Camisas' },
  { slug: 'acessorios', label: 'Acessórios' },
  { slug: 'action-figures', label: 'Action Figures' },
  { slug: 'cosplay', label: 'Cosplay' },
  { slug: 'replicas', label: 'Réplicas' },
];

export function categoryLabel(slug: CategorySlug): string {
  return CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
}

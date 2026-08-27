import { Injectable, computed, signal } from '@angular/core';

import { Anime, AnimeRef } from './anime';
import { CategorySlug } from './category';
import { Product } from './product';

const ANIMES: readonly Anime[] = [
  { slug: 'frieren', name: 'Frieren', originalName: 'Sousou no Frieren' },
  { slug: 'jujutsu-kaisen', name: 'Jujutsu Kaisen' },
  { slug: 'chainsaw-man', name: 'Chainsaw Man' },
  { slug: 'demon-slayer', name: 'Demon Slayer', originalName: 'Kimetsu no Yaiba' },
  { slug: 'attack-on-titan', name: 'Attack on Titan', originalName: 'Shingeki no Kyojin' },
  { slug: 'berserk', name: 'Berserk' },
  { slug: 'one-piece', name: 'One Piece' },
  { slug: 'spy-family', name: 'Spy × Family' },
  { slug: 'evangelion', name: 'Evangelion', originalName: 'Shin Seiki Evangelion' },
  { slug: 'dandadan', name: 'Dandadan' },
  { slug: 'mob-psycho', name: 'Mob Psycho 100' },
  { slug: 'cowboy-bebop', name: 'Cowboy Bebop' },
  { slug: 'naruto', name: 'Naruto' },
];

function ref(slug: string): AnimeRef {
  const anime = ANIMES.find((candidate) => candidate.slug === slug);
  if (!anime) throw new Error(`Anime desconhecido no catalogo: ${slug}`);

  return { slug: anime.slug, name: anime.name };
}

const stock = (units: number) => ({ kind: 'stock', units }) as const;
const order = (days: number) => ({ kind: 'made-to-order', days }) as const;

const DEMO: readonly Product[] = [
  {
    id: 'p-01',
    slug: 'camiseta-frieren-jornada',
    title: 'Camiseta Frieren: A Jornada',
    anime: ref('frieren'),
    category: 'camisas',
    price: 89.9,
    compareAt: 119.9,
    availability: stock(40),
    rating: { average: 4.7, count: 312 },
  },
  {
    id: 'p-02',
    slug: 'broche-fern',
    title: 'Broche esmaltado Fern',
    anime: ref('frieren'),
    category: 'acessorios',
    price: 34.9,
    availability: stock(3),
    rating: { average: 4.6, count: 87 },
  },
  {
    id: 'p-03',
    slug: 'figure-gojo',
    title: 'Action figure Gojo Satoru 1/7',
    anime: ref('jujutsu-kaisen'),
    category: 'action-figures',
    price: 749,
    availability: stock(2),
    critical: true,
    rating: { average: 5, count: 19 },
  },
  {
    id: 'p-04',
    slug: 'colar-pochita',
    title: 'Colar Pochita em prata 925',
    anime: ref('chainsaw-man'),
    category: 'acessorios',
    price: 149.9,
    compareAt: 199.9,
    availability: stock(12),
    rating: { average: 4.8, count: 214 },
  },
  {
    id: 'p-05',
    slug: 'peruca-makima',
    title: 'Peruca cosplay Makima',
    anime: ref('chainsaw-man'),
    category: 'cosplay',
    price: 219.9,
    compareAt: 259.9,
    availability: stock(0),
    rating: { average: 4.7, count: 128 },
  },
  {
    id: 'p-06',
    slug: 'camiseta-nezuko',
    title: 'Camiseta Nezuko',
    anime: ref('demon-slayer'),
    category: 'camisas',
    price: 89.9,
    availability: stock(24),
    rating: { average: 4.4, count: 96 },
  },
  {
    id: 'p-07',
    slug: 'suporte-fone-eva',
    title: 'Suporte de fone EVA-01',
    anime: ref('evangelion'),
    category: 'acessorios',
    price: 79.9,
    availability: stock(9),
    printed: true,
    rating: { average: 4.5, count: 63 },
  },
  {
    id: 'p-08',
    slug: 'chapeu-luffy',
    title: 'Chapéu de palha do Luffy',
    anime: ref('one-piece'),
    category: 'cosplay',
    price: 134,
    availability: stock(6),
    rating: { average: 4.3, count: 58 },
  },
  {
    id: 'p-09',
    slug: 'figure-anya',
    title: 'Action figure Anya Forger',
    anime: ref('spy-family'),
    category: 'action-figures',
    price: 289,
    compareAt: 349,
    availability: stock(5),
    rating: { average: 4.9, count: 46 },
  },
  {
    id: 'p-10',
    slug: 'cajado-fern',
    title: 'Cajado da Fern (réplica 1:1)',
    anime: ref('frieren'),
    category: 'replicas',
    price: 389,
    availability: order(18),
    printed: true,
    rating: { average: 4.9, count: 37 },
  },
  {
    id: 'p-11',
    slug: 'dragon-slayer-guts',
    title: 'Dragon Slayer do Guts (réplica 1,45 m)',
    anime: ref('berserk'),
    category: 'replicas',
    price: 1290,
    availability: order(30),
    printed: true,
    critical: true,
    rating: { average: 5, count: 12 },
  },
  {
    id: 'p-12',
    slug: 'lanca-longinus',
    title: 'Lança de Longinus (réplica de mesa)',
    anime: ref('evangelion'),
    category: 'replicas',
    price: 179.9,
    availability: order(12),
    printed: true,
    rating: { average: 4.8, count: 41 },
  },
  {
    id: 'p-13',
    slug: 'camiseta-dandadan',
    title: 'Camiseta Dandadan: Turbo Vovó',
    anime: ref('dandadan'),
    category: 'camisas',
    price: 94.9,
    availability: stock(18),
    rating: { average: 4.6, count: 74 },
  },
  {
    id: 'p-14',
    slug: 'kit-broches-jujutsu',
    title: 'Kit com 4 broches Jujutsu Kaisen',
    anime: ref('jujutsu-kaisen'),
    category: 'acessorios',
    price: 59.9,
    availability: stock(30),
    rating: { average: 4.5, count: 103 },
  },
];

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly products = signal<readonly Product[]>(DEMO);
  private readonly catalogue = signal<readonly Anime[]>(ANIMES);

  readonly all = this.products.asReadonly();
  readonly animes = this.catalogue.asReadonly();

  readonly onSale = computed(() =>
    this.products().filter((p) => p.compareAt !== undefined && p.compareAt > p.price),
  );

  readonly critical = computed(() => this.products().filter((p) => p.critical === true));

  bySlug(slug: string): Product | undefined {
    return this.products().find((product) => product.slug === slug);
  }

  animeBySlug(slug: string): Anime | undefined {
    return this.catalogue().find((anime) => anime.slug === slug);
  }

  byAnime(slug: string): readonly Product[] {
    return this.products().filter((product) => product.anime.slug === slug);
  }

  byCategory(slug: CategorySlug): readonly Product[] {
    return this.products().filter((product) => product.category === slug);
  }

  countByAnime(slug: string): number {
    return this.byAnime(slug).length;
  }
}

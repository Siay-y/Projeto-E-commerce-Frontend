import { Injectable, computed, signal } from '@angular/core';

import { Anime, AnimeRef } from './anime';
import { CategorySlug } from './category';
import { Product, ProductOptions } from './product';

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

function wear(units: Record<string, number>): ProductOptions {
  return {
    axis: 'size',
    values: Object.entries(units).map(([label, count]) => ({
      id: label.toLowerCase(),
      label,
      availability: stock(count),
    })),
  };
}

const DECORATIVO = 'Item decorativo para exposição, sem fio e sem ponta cortante';

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
    summary:
      'A linha do horizonte da viagem da Frieren atravessa a frente inteira da peça, em silk de alta densidade sobre malha penteada.',
    details: [
      'Malha penteada 30.1, 100% algodão',
      'Silk de alta densidade, com toque macio',
      'Modelagem unissex, corte reto',
      'Lavar do avesso, sem alvejante',
    ],
    options: wear({ PP: 4, P: 12, M: 15, G: 9, GG: 0, XG: 3 }),
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
    summary:
      'Esmalte duro sobre metal, com os contornos em relevo. Segura firme na mochila e na lapela.',
    details: [
      'Dois pinos de borracha, não gira no tecido',
      'Esmalte duro, resistente a arranhão',
      'Acompanha cartela ilustrada',
    ],
    specs: [
      { label: 'Material', value: 'Metal esmaltado' },
      { label: 'Altura', value: '4,2 cm' },
      { label: 'Fixação', value: 'Dois pinos de borracha' },
    ],
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
    summary:
      'Pose de combate com a venda erguida, pintura com sombreado feito à mão e base translúcida que sugere o Vazio Ilimitado.',
    details: [
      'Produção limitada, sem reposição prevista',
      'Base translúcida inclusa',
      'Caixa com janela, própria para colecionador',
    ],
    specs: [
      { label: 'Escala', value: '1/7' },
      { label: 'Altura', value: '26 cm' },
      { label: 'Material', value: 'PVC e ABS' },
      { label: 'Base', value: 'Inclusa' },
    ],
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
    summary:
      'Pingente do Pochita em prata 925 maciça, com a corrente de elos finos que some sob a gola.',
    details: [
      'Prata 925 com certificado',
      'Corrente de 45 cm, fecho boia',
      'Acompanha flanela para polimento',
    ],
    specs: [
      { label: 'Material', value: 'Prata 925' },
      { label: 'Pingente', value: '1,8 cm' },
      { label: 'Corrente', value: '45 cm' },
    ],
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
    summary:
      'Fibra resistente a calor, já com as tranças montadas. Touca ajustável, então serve na maioria das cabeças sem precisar de tamanho.',
    details: [
      'Fibra sintética resistente até 180 °C',
      'Touca ajustável com dois elásticos internos',
      'Tranças montadas, pronta para usar',
    ],
    specs: [
      { label: 'Comprimento', value: '100 cm' },
      { label: 'Fibra', value: 'Sintética, resistente a calor' },
      { label: 'Touca', value: 'Ajustável, tamanho único' },
    ],
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
    summary:
      'Estampa central com o padrão do quimono da Nezuko, em três cores sobre malha preta.',
    details: [
      'Malha penteada 30.1, 100% algodão',
      'Estampa em três cores',
      'Modelagem unissex, corte reto',
      'Lavar do avesso, sem alvejante',
    ],
    options: wear({ PP: 2, P: 8, M: 11, G: 7, GG: 5, XG: 0 }),
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
    summary:
      'O busto da Unidade 01 segurando o headset pelo arco. Impresso em camadas finas e pintado à mão, uma peça de cada vez.',
    details: [
      'Impresso em 3D com camada de 0,12 mm',
      'Pintado à mão, então há variação entre peças',
      'Base com feltro antiderrapante',
    ],
    specs: [
      { label: 'Altura', value: '24 cm' },
      { label: 'Material', value: 'PLA' },
      { label: 'Acabamento', value: 'Lixado e pintado à mão' },
    ],
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
    summary:
      'Palha trançada de verdade, com a fita vermelha costurada e aba firme o bastante para não cair no meio do evento.',
    details: [
      'Palha natural trançada',
      'Fita costurada, não é colada',
      'Cordão interno para ajuste fino',
    ],
    options: {
      axis: 'size',
      values: [
        { id: '56', label: '56 cm', note: 'Cabeça pequena', availability: stock(2) },
        { id: '58', label: '58 cm', note: 'Cabeça média', availability: stock(3) },
        { id: '60', label: '60 cm', note: 'Cabeça grande', availability: stock(1) },
      ],
    },
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
    summary:
      'A Anya no uniforme da Eden, com o sorriso de quem acabou de ler um pensamento que não devia.',
    details: [
      'Pintura com sombreado suave no uniforme',
      'Base redonda inclusa',
      'Caixa com janela frontal',
    ],
    specs: [
      { label: 'Escala', value: '1/8' },
      { label: 'Altura', value: '17 cm' },
      { label: 'Material', value: 'PVC' },
      { label: 'Base', value: 'Inclusa' },
    ],
  },
  {
    id: 'p-10',
    slug: 'cajado-fern',
    title: 'Cajado da Fern',
    anime: ref('frieren'),
    category: 'replicas',
    price: 289,
    availability: order(18),
    printed: true,
    rating: { average: 4.9, count: 37 },
    summary:
      'Impresso sob encomenda, lixado camada por camada e pintado à mão. Desmonta em três partes, então cabe em mala de evento.',
    details: [
      DECORATIVO,
      'Impresso e pintado só depois do pedido',
      'Desmontável em três partes, com rosca metálica',
      'Acompanha suporte de mesa',
    ],
    specs: [
      { label: 'Material', value: 'PLA' },
      { label: 'Acabamento', value: 'Lixado e pintado à mão' },
      { label: 'Montagem', value: 'Três partes com rosca' },
    ],
    options: {
      axis: 'scale',
      values: [
        { id: '80cm', label: '80 cm', note: 'Cabe na mala', price: 289, availability: order(14) },
        { id: '1-1', label: '1,40 m', note: 'Escala 1:1', price: 389, availability: order(18) },
      ],
    },
  },
  {
    id: 'p-11',
    slug: 'dragon-slayer-guts',
    title: 'Dragon Slayer do Guts',
    anime: ref('berserk'),
    category: 'replicas',
    price: 590,
    availability: order(30),
    printed: true,
    critical: true,
    rating: { average: 5, count: 12 },
    summary:
      'O bloco bruto de ferro do Guts, com as marcas de golpe reproduzidas uma a uma. A versão de 1,45 m é do tamanho da lâmina no mangá.',
    details: [
      DECORATIVO,
      'Reforço interno em tubo de alumínio',
      'Desmontável em quatro partes',
      'Acompanha suporte de parede',
    ],
    specs: [
      { label: 'Material', value: 'PLA+ com alma de alumínio' },
      { label: 'Acabamento', value: 'Envelhecido à mão' },
      { label: 'Montagem', value: 'Quatro partes' },
    ],
    options: {
      axis: 'scale',
      values: [
        { id: '60cm', label: '60 cm', note: 'De mesa', price: 590, availability: order(20) },
        { id: '145cm', label: '1,45 m', note: 'Escala 1:1', price: 1290, availability: order(30) },
      ],
    },
  },
  {
    id: 'p-12',
    slug: 'lanca-longinus',
    title: 'Lança de Longinus',
    anime: ref('evangelion'),
    category: 'replicas',
    price: 179.9,
    availability: order(12),
    printed: true,
    rating: { average: 4.8, count: 41 },
    summary:
      'A hélice dupla da lança sai em peça única na versão de mesa, e em duas partes na de 90 cm.',
    details: [
      DECORATIVO,
      'Impressa em resina, com detalhe mais fino que o PLA',
      'Pintura em vermelho com verniz fosco',
      'Base de mesa inclusa',
    ],
    specs: [
      { label: 'Material', value: 'Resina' },
      { label: 'Acabamento', value: 'Verniz fosco' },
    ],
    options: {
      axis: 'scale',
      values: [
        { id: '40cm', label: '40 cm', note: 'De mesa', price: 179.9, availability: order(10) },
        { id: '90cm', label: '90 cm', note: 'De chão', price: 329, availability: order(16) },
      ],
    },
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
    summary:
      'A Turbo Vovó em corrida, com rastro de velocidade que dá a volta pela lateral da peça.',
    details: [
      'Malha penteada 30.1, 100% algodão',
      'Estampa contínua da frente para a lateral',
      'Modelagem unissex, corte reto',
      'Lavar do avesso, sem alvejante',
    ],
    options: wear({ PP: 3, P: 6, M: 9, G: 6, GG: 4, XG: 2 }),
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
    summary:
      'Gojo, Yuji, Megumi e Nobara em quatro broches esmaltados, na cartela do time completo.',
    details: [
      'Quatro broches, vendidos só em kit',
      'Esmalte duro sobre metal',
      'Cartela ilustrada, serve de display',
    ],
    specs: [
      { label: 'Peças', value: '4 broches' },
      { label: 'Material', value: 'Metal esmaltado' },
      { label: 'Altura', value: 'Entre 3,5 e 4,5 cm' },
    ],
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

  /**
   * As duas listas nunca se completam uma com a outra: cada prateleira do fim
   * da página tem um título que promete um recorte, e emprestar item de fora
   * faz o título mentir.
   */
  sameAnime(product: Product, limit: number): readonly Product[] {
    return this.byAnime(product.anime.slug)
      .filter((candidate) => candidate.id !== product.id)
      .slice(0, limit);
  }

  sameDepartment(product: Product, limit: number): readonly Product[] {
    return this.byCategory(product.category)
      .filter(
        (candidate) =>
          candidate.id !== product.id && candidate.anime.slug !== product.anime.slug,
      )
      .slice(0, limit);
  }
}

export const PATHS = {
  home: '/',

  animes: '/animes',
  anime: (slug: string) => ['/animes', slug] as const,

  categories: '/categorias',
  category: (slug: string) => ['/categorias', slug] as const,

  product: (slug: string) => ['/produto', slug] as const,

  cart: '/carrinho',
  checkout: '/checkout',

  login: '/entrar',
  register: '/cadastro',
  recover: '/recuperar-senha',

  account: '/conta',
  orders: '/conta/pedidos',
  addresses: '/conta/enderecos',
  security: '/conta/seguranca',

  lootBox: '/loot-box',
  about: '/sobre',

  tracking: '/rastrear',
  returns: '/trocas',
  delivery: '/entrega',
  contact: '/contato',

  terms: '/termos',
  privacy: '/privacidade',
} as const;

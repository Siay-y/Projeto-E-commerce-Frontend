export interface Anime {
  readonly slug: string;
  readonly name: string;

  /** Titulo original */
  readonly originalName?: string;

  /** Capa do card no hub */
  readonly cover?: string;

  /** Faixa larga do topo da pagina do anime. */
  readonly banner?: string;
}

export interface AnimeRef {
  readonly slug: string;
  readonly name: string;
}

export type TipoImovel = 'casa' | 'apartamento' | 'kitnet' | 'comercial' | 'terreno';
export type FinalidadeImovel = 'venda' | 'aluguel';

export interface Imovel {
  id: number;
  titulo: string;
  descricao: string | null;
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  endereco: string;
  cidade: string;
  preco: number;
  area_m2: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  data_disponibilidade: string;
  foto_url: string | null;
  disponivel: boolean;
  contato_telefone: string;
  created_at: string;
  updated_at: string;
}

export interface FotoImovel {
  uri: string;
  name: string;
  type: string;
}

export interface CreateImovelDTO {
  titulo: string;
  descricao?: string;
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  endereco: string;
  cidade: string;
  preco: number;
  area_m2: number;
  quartos: number;
  banheiros: number;
  vagas?: number;
  data_disponibilidade: string;
  foto?: FotoImovel;
  disponivel?: boolean;
  contato_telefone: string;
}

export type UpdateImovelDTO = Partial<CreateImovelDTO>;

export interface ImovelFiltros {
  busca?: string;
  tipo?: TipoImovel;
  finalidade?: FinalidadeImovel;
  cidade?: string;
  disponivel?: boolean;
  preco_min?: number;
  preco_max?: number;
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface ImovelResponse {
  data: Imovel;
  message?: string;
}

export interface UpdateFotoResponse {
  message: string;
  foto_url: string;
}

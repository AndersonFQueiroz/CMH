// Estado, validação local e conversões do formulário de imóvel (issue #22).
// As regras espelham StoreImovelRequest/UpdateImovelRequest do backend.
import axios from 'axios';

import type { ApiErrorResponse } from '../services/api';
import type {
  CreateImovelDTO,
  FinalidadeImovel,
  Imovel,
  TipoImovel,
  UpdateImovelDTO,
} from '../types/imovel';
import {
  dataBRParaISO,
  decimalParaNumero,
  hojeISO,
  isoParaDataBR,
  mascaraTelefone,
  moedaParaNumero,
  numeroParaDecimal,
  numeroParaMoeda,
  somenteDigitos,
} from './masks';

export interface ImovelFormValues {
  titulo: string;
  descricao: string;
  tipo: TipoImovel | null;
  finalidade: FinalidadeImovel | null;
  endereco: string;
  cidade: string;
  /** Texto mascarado, ex.: `R$ 2.500,00`. */
  preco: string;
  /** Decimal com vírgula, ex.: `120,5`. */
  area_m2: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  /** `DD/MM/AAAA`. */
  data_disponibilidade: string;
  /** `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`. */
  contato_telefone: string;
  disponivel: boolean;
}

export type ImovelFormField = keyof ImovelFormValues;
/** Inclui `foto`, que fica fora de `ImovelFormValues` por não ser texto. */
export type ImovelFormErrors = Partial<Record<ImovelFormField | 'foto', string>>;

export const TIPO_OPCOES: { label: string; value: TipoImovel }[] = [
  { label: 'Casa', value: 'casa' },
  { label: 'Apartamento', value: 'apartamento' },
  { label: 'Kitnet', value: 'kitnet' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Terreno', value: 'terreno' },
];

export const FINALIDADE_OPCOES: { label: string; value: FinalidadeImovel }[] = [
  { label: 'Venda', value: 'venda' },
  { label: 'Aluguel', value: 'aluguel' },
];

export const VALORES_INICIAIS: ImovelFormValues = {
  titulo: '',
  descricao: '',
  tipo: null,
  finalidade: null,
  endereco: '',
  cidade: '',
  preco: '',
  area_m2: '',
  quartos: '0',
  banheiros: '0',
  vagas: '0',
  data_disponibilidade: '',
  contato_telefone: '',
  disponivel: true,
};

const CAMPOS_DO_FORMULARIO = Object.keys(VALORES_INICIAIS) as ImovelFormField[];

export function valoresDoImovel(imovel: Imovel): ImovelFormValues {
  return {
    titulo: imovel.titulo,
    descricao: imovel.descricao ?? '',
    tipo: imovel.tipo,
    finalidade: imovel.finalidade,
    endereco: imovel.endereco,
    cidade: imovel.cidade,
    preco: numeroParaMoeda(Number(imovel.preco)),
    area_m2: numeroParaDecimal(Number(imovel.area_m2)),
    quartos: String(imovel.quartos),
    banheiros: String(imovel.banheiros),
    vagas: String(imovel.vagas ?? 0),
    data_disponibilidade: isoParaDataBR(imovel.data_disponibilidade),
    contato_telefone: mascaraTelefone(imovel.contato_telefone),
    disponivel: imovel.disponivel,
  };
}

function validarInteiro(
  texto: string,
  max: number,
  obrigatorio: string,
  maximo: string,
): string | undefined {
  if (texto.trim() === '') return obrigatorio;
  if (!/^\d+$/.test(texto)) return 'Informe um número inteiro.';
  if (Number(texto) > max) return maximo;
  return undefined;
}

interface OpcoesValidacao {
  /** `YYYY-MM-DD`; padrão: data local de hoje. */
  hoje?: string;
  /**
   * Na edição, a data original pode já ter passado. Como só enviamos campos
   * alterados, a regra "hoje ou futura" só vale quando a data foi modificada.
   */
  dataOriginal?: string;
}

export function validarImovelForm(
  valores: ImovelFormValues,
  { hoje = hojeISO(), dataOriginal }: OpcoesValidacao = {},
): ImovelFormErrors {
  const erros: ImovelFormErrors = {};
  const titulo = valores.titulo.trim();

  if (!titulo) erros.titulo = 'O título é obrigatório.';
  else if (titulo.length < 5) erros.titulo = 'O título deve ter no mínimo 5 caracteres.';
  else if (titulo.length > 150) erros.titulo = 'O título deve ter no máximo 150 caracteres.';

  if (!valores.tipo) erros.tipo = 'O tipo do imóvel é obrigatório.';
  if (!valores.finalidade) erros.finalidade = 'A finalidade é obrigatória.';

  const endereco = valores.endereco.trim();
  if (!endereco) erros.endereco = 'O endereço é obrigatório.';
  else if (endereco.length > 200) erros.endereco = 'O endereço deve ter no máximo 200 caracteres.';

  const cidade = valores.cidade.trim();
  if (!cidade) erros.cidade = 'A cidade é obrigatória.';
  else if (cidade.length > 100) erros.cidade = 'A cidade deve ter no máximo 100 caracteres.';

  if (moedaParaNumero(valores.preco) === null) erros.preco = 'O preço é obrigatório.';

  const area = decimalParaNumero(valores.area_m2);
  if (valores.area_m2.trim() === '') erros.area_m2 = 'A área em m² é obrigatória.';
  else if (area === null) erros.area_m2 = 'A área deve ser um valor numérico.';
  else if (area < 0.01) erros.area_m2 = 'A área deve ser maior que zero.';

  erros.quartos = validarInteiro(
    valores.quartos, 50,
    'A quantidade de quartos é obrigatória.',
    'A quantidade de quartos deve ser no máximo 50.',
  );
  erros.banheiros = validarInteiro(
    valores.banheiros, 20,
    'A quantidade de banheiros é obrigatória.',
    'A quantidade de banheiros deve ser no máximo 20.',
  );
  if (valores.vagas.trim() !== '') {
    erros.vagas = validarInteiro(
      valores.vagas, 20, '',
      'A quantidade de vagas deve ser no máximo 20.',
    );
  }

  if (valores.tipo === 'terreno') {
    if (!erros.quartos && Number(valores.quartos) !== 0) {
      erros.quartos = 'Um terreno não pode ter quartos.';
    }
    if (!erros.banheiros && Number(valores.banheiros) !== 0) {
      erros.banheiros = 'Um terreno não pode ter banheiros.';
    }
  }

  const dataISO = dataBRParaISO(valores.data_disponibilidade);
  if (!valores.data_disponibilidade) {
    erros.data_disponibilidade = 'A data de disponibilidade é obrigatória.';
  } else if (!dataISO) {
    erros.data_disponibilidade = 'Informe uma data válida no formato DD/MM/AAAA.';
  } else if (dataISO < hoje && dataISO !== dataOriginal) {
    erros.data_disponibilidade = 'A data de disponibilidade deve ser hoje ou futura.';
  }

  const telefone = somenteDigitos(valores.contato_telefone);
  if (!telefone) erros.contato_telefone = 'O telefone de contato é obrigatório.';
  else if (telefone.length < 10) {
    erros.contato_telefone = 'Informe o telefone com DDD: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.';
  }

  for (const campo of CAMPOS_DO_FORMULARIO) {
    if (erros[campo] === undefined) delete erros[campo];
  }
  return erros;
}

export function temErros(erros: ImovelFormErrors): boolean {
  return Object.keys(erros).length > 0;
}

/** Converte valores já validados no payload da API. */
export function montarDTO(valores: ImovelFormValues): CreateImovelDTO {
  if (!valores.tipo || !valores.finalidade) {
    throw new Error('Tipo e finalidade são obrigatórios.');
  }

  return {
    titulo: valores.titulo.trim(),
    descricao: valores.descricao.trim(),
    tipo: valores.tipo,
    finalidade: valores.finalidade,
    endereco: valores.endereco.trim(),
    cidade: valores.cidade.trim(),
    preco: moedaParaNumero(valores.preco) ?? 0,
    area_m2: decimalParaNumero(valores.area_m2) ?? 0,
    quartos: Number(valores.quartos),
    banheiros: Number(valores.banheiros),
    vagas: valores.vagas.trim() === '' ? 0 : Number(valores.vagas),
    data_disponibilidade: dataBRParaISO(valores.data_disponibilidade) ?? '',
    contato_telefone: mascaraTelefone(valores.contato_telefone),
    disponivel: valores.disponivel,
  };
}

/** Na edição, envia apenas os campos que mudaram em relação ao anúncio carregado. */
export function camposAlterados(original: CreateImovelDTO, atual: CreateImovelDTO): UpdateImovelDTO {
  const alterados: Record<string, unknown> = {};
  for (const campo of Object.keys(atual) as (keyof CreateImovelDTO)[]) {
    if (atual[campo] !== original[campo]) alterados[campo] = atual[campo];
  }
  return alterados as UpdateImovelDTO;
}

export interface ErrosDaApi {
  campos: ImovelFormErrors;
  /** Mensagem para exibir no topo do formulário, se houver. */
  geral: string | null;
}

function ehCampoDoFormulario(campo: string): campo is keyof ImovelFormErrors {
  return campo === 'foto' || (CAMPOS_DO_FORMULARIO as string[]).includes(campo);
}

/** Converte a resposta 422 do Laravel em erros por campo, em português. */
export function errosDaApi(error: unknown): ErrosDaApi {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      campos: {},
      geral: error instanceof Error ? error.message : 'Não foi possível salvar o anúncio.',
    };
  }

  if (error.response?.status === 413) return { campos: { foto: error.message }, geral: null };

  const errors = error.response?.status === 422 ? error.response.data?.errors : undefined;
  if (!errors) return { campos: {}, geral: error.message };

  const campos: ImovelFormErrors = {};
  const outros: string[] = [];
  for (const [campo, mensagens] of Object.entries(errors)) {
    const mensagem = mensagens[0];
    if (!mensagem) continue;
    if (ehCampoDoFormulario(campo)) campos[campo] = mensagem;
    else outros.push(mensagem);
  }

  return {
    campos,
    geral: outros.length > 0 ? outros.join('\n') : error.message,
  };
}

/// <reference types="node" />

import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { createElement } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { act, create, type ReactTestRenderer, type ReactTestRendererJSON } from 'react-test-renderer';

// Instala o mock do react-native antes de importar as telas.
import { chamadasDoAlerta, flatList } from './helpers/mockReactNative';
import { ImovelDetailScreen } from '../src/screens/ImovelDetailScreen';
import { ImovelListScreen } from '../src/screens/ImovelListScreen';
import api from '../src/services/api';
import { notificarImovelExcluido, onImovelExcluido } from '../src/services/imovelEvents';
import type { RootStackParamList } from '../src/navigation/types';
import type { Imovel, PaginatedResponse } from '../src/types/imovel';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

type DetailProps = NativeStackScreenProps<RootStackParamList, 'ImovelDetail'>;
type ListProps = NativeStackScreenProps<RootStackParamList, 'ImovelList'>;

const imovelFixture: Imovel = {
  id: 7, titulo: 'Casa perto da praia', descricao: null, tipo: 'casa', finalidade: 'venda',
  endereco: 'Rua das Palmeiras, 123', cidade: 'Praia Grande/SP', preco: 350000,
  area_m2: 120, quartos: 3, banheiros: 2, vagas: 1,
  data_disponibilidade: '2099-10-01', foto_url: null, disponivel: true,
  contato_telefone: '(13) 99999-1234', created_at: '', updated_at: '',
};
const outroImovel: Imovel = { ...imovelFixture, id: 8, titulo: 'Apartamento central' };

const adapterOriginal = api.defaults.adapter;
const baseURLOriginal = api.defaults.baseURL;
let requests: InternalAxiosRequestConfig[];
let renderer: ReactTestRenderer | undefined;
let cancelamentos: (() => void)[];

beforeEach(() => {
  requests = [];
  chamadasDoAlerta.length = 0;
  flatList.dados = null;
  cancelamentos = [];
  api.defaults.baseURL = 'http://localhost:8000/api/v1';
});

afterEach(async () => {
  await act(async () => { renderer?.unmount(); });
  renderer = undefined;
  for (const cancelar of cancelamentos) cancelar();
  api.defaults.baseURL = baseURLOriginal;
  api.defaults.adapter = adapterOriginal;
});

function pendente<T>(): { promise: Promise<T>; resolve: (value: T) => void } {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => { resolve = resolver; });
  return { promise, resolve };
}

function resposta(status: number, data: unknown, config: InternalAxiosRequestConfig) {
  return {
    data, status, statusText: String(status), headers: new AxiosHeaders(), config,
  };
}

function erro404(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError('Request failed with status code 404', 'ERR_BAD_RESPONSE', config, undefined, {
    data: { message: 'Not Found.' }, status: 404, statusText: 'Not Found',
    headers: new AxiosHeaders(), config,
  });
}

function pagina(imoveis: Imovel[]): PaginatedResponse<Imovel> {
  return {
    data: imoveis,
    links: { first: '', last: '', prev: null, next: null },
    meta: {
      current_page: 1, last_page: 1, per_page: 15, total: imoveis.length,
      from: imoveis.length ? 1 : null, to: imoveis.length || null,
    },
  };
}

async function montarDetalhe(id: number): Promise<{ goBacks: { valor: number } }> {
  const registros = { valor: 0 };
  const navigation = {
    goBack: (): void => { registros.valor += 1; },
    navigate: (): void => undefined,
    setOptions: (): void => undefined,
  } as unknown as DetailProps['navigation'];
  const route = { name: 'ImovelDetail', params: { id } } as unknown as DetailProps['route'];
  let novo!: ReactTestRenderer;
  await act(async () => {
    novo = create(createElement(ImovelDetailScreen, { navigation, route }));
  });
  renderer = novo;
  return { goBacks: registros };
}

async function montarLista(): Promise<void> {
  const navigation = {
    goBack: (): void => undefined,
    navigate: (): void => undefined,
    setOptions: (): void => undefined,
  } as unknown as ListProps['navigation'];
  const route = { name: 'ImovelList' } as unknown as ListProps['route'];
  let novo!: ReactTestRenderer;
  await act(async () => {
    novo = create(createElement(ImovelListScreen, { navigation, route }));
  });
  renderer = novo;
}

function coletarTextos(node: string | ReactTestRendererJSON): string[] {
  if (typeof node === 'string') return [node];
  return (node.children ?? []).flatMap(coletarTextos);
}

function textoDaTela(): string[] {
  const raiz = (renderer?.toJSON() ?? null) as ReactTestRendererJSON | null;
  return raiz ? coletarTextos(raiz) : [];
}

function acharPressavel(node: ReactTestRendererJSON | string, textoBuscado: string): ReactTestRendererJSON | undefined {
  if (typeof node === 'string') return undefined;
  const rotulo = typeof node.props.accessibilityLabel === 'string' ? node.props.accessibilityLabel : '';
  if (
    node.type === 'pressable' &&
    (rotulo.includes(textoBuscado) ||
      coletarTextos(node).some((texto) => texto.includes(textoBuscado)))
  ) {
    return node;
  }
  for (const filho of node.children ?? []) {
    const achado = acharPressavel(filho, textoBuscado);
    if (achado) return achado;
  }
  return undefined;
}

function pressavelComTexto(textoBuscado: string): ReactTestRendererJSON | undefined {
  const raiz = renderer?.toJSON();
  return raiz && !Array.isArray(raiz) ? acharPressavel(raiz, textoBuscado) : undefined;
}

function pressionar(botao: ReactTestRendererJSON): void {
  act(() => { (botao.props.onPress as () => void)(); });
}

function delecoes(): InternalAxiosRequestConfig[] {
  return requests.filter((config) => config.method === 'delete');
}

function idsDaLista(): number[] {
  return (flatList.dados ?? []).map((item) => (item as Imovel).id);
}

function ultimaChamada(): NonNullable<typeof chamadasDoAlerta[number]> {
  assert.ok(chamadasDoAlerta.length > 0, 'Alert.alert deve ter sido chamado');
  return chamadasDoAlerta[chamadasDoAlerta.length - 1];
}

test('exclusão pede confirmação via Alert antes de qualquer DELETE e cancelar não envia request', async () => {
  const carregamento = pendente<Imovel>();
  api.defaults.adapter = async (config) => {
    requests.push(config);
    assert.equal(config.method, 'get');
    return resposta(200, { data: await carregamento.promise }, config);
  };

  await montarDetalhe(7);
  await act(async () => { carregamento.resolve(imovelFixture); });
  assert.ok(textoDaTela().some((t) => t.includes('Casa perto da praia')));

  const botaoExcluir = pressavelComTexto('Excluir anúncio');
  assert.ok(botaoExcluir, 'botão "Excluir anúncio" deve estar visível');
  pressionar(botaoExcluir!);

  assert.equal(delecoes().length, 0, 'nenhum DELETE antes da confirmação');
  const alerta = ultimaChamada();
  assert.equal(alerta.titulo, 'Excluir anúncio?');
  assert.ok(alerta.mensagem.includes('Casa perto da praia'), 'mensagem informa o título');
  assert.match(alerta.mensagem, /definitiva/i, 'mensagem avisa que a ação é definitiva');
  assert.deepEqual(
    alerta.botoes.map(({ text, style }) => [text, style]),
    [['Cancelar', 'cancel'], ['Excluir', 'destructive']],
  );

  // Cancelar fecha o alerta sem disparar nada.
  act(() => { alerta.botoes[0].onPress?.(); });
  assert.equal(delecoes().length, 0);
});

test('confirmar excluir dispara DELETE /imoveis/:id, volta e emite o evento de exclusão', async () => {
  const exclusao = pendente<void>();
  api.defaults.adapter = async (config) => {
    requests.push(config);
    if (config.method === 'delete') {
      await exclusao.promise;
      return resposta(204, '', config);
    }
    return resposta(200, { data: imovelFixture }, config);
  };

  const eventos: number[] = [];
  cancelamentos.push(onImovelExcluido((idExcluido) => eventos.push(idExcluido)));

  const { goBacks } = await montarDetalhe(7);
  const botaoExcluir = pressavelComTexto('Excluir anúncio');
  assert.ok(botaoExcluir);
  pressionar(botaoExcluir!);
  const alerta = ultimaChamada();
  assert.equal(alerta.titulo, 'Excluir anúncio?');

  await act(async () => { alerta.botoes[1].onPress?.(); });

  const delecao = delecoes()[0];
  assert.ok(delecao, 'DELETE só é enviado após confirmar');
  assert.equal(delecao.url, '/imoveis/7');
  assert.equal(goBacks.valor, 0, 'não volta antes da resposta da API');
  assert.deepEqual(eventos, []);

  await act(async () => { exclusao.resolve(); });

  assert.equal(goBacks.valor, 1, 'sucesso volta para a listagem');
  assert.deepEqual(eventos, [7], 'evento de exclusão é emitido com o id');
});

test('evento de exclusão remove o anúncio da lista sem nova requisição', async () => {
  api.defaults.adapter = async (config) => {
    requests.push(config);
    assert.equal(config.method, 'get');
    return resposta(200, pagina([imovelFixture, outroImovel]), config);
  };

  await montarLista();
  assert.deepEqual(idsDaLista(), [7, 8]);
  assert.equal(requests.length, 1);

  act(() => { notificarImovelExcluido(7); });
  assert.deepEqual(idsDaLista(), [8], 'item listado é removido');
  assert.equal(requests.length, 1, 'a remoção não dispara nova batida');

  act(() => { notificarImovelExcluido(999); });
  assert.deepEqual(idsDaLista(), [8], 'id não listado não altera a lista');
  assert.equal(requests.length, 1);
});

test('DELETE com 404 exibe "Imóvel não encontrado." e mantém o usuário na tela', async () => {
  api.defaults.adapter = async (config) => {
    requests.push(config);
    if (config.method === 'delete') throw erro404(config);
    return resposta(200, { data: imovelFixture }, config);
  };

  const { goBacks } = await montarDetalhe(7);
  const botaoExcluir = pressavelComTexto('Excluir anúncio');
  assert.ok(botaoExcluir);
  pressionar(botaoExcluir!);
  const alerta = ultimaChamada();
  assert.equal(alerta.titulo, 'Excluir anúncio?');

  await act(async () => { alerta.botoes[1].onPress?.(); });

  const erro = ultimaChamada();
  assert.equal(erro.titulo, 'Erro ao excluir');
  assert.equal(erro.mensagem, 'Imóvel não encontrado.');
  assert.equal(goBacks.valor, 0, 'falha não sai da tela');
  assert.ok(textoDaTela().some((t) => t.includes('Casa perto da praia')));
});

test('DELETE com falha de rede exibe a mensagem de conexão amigável', async () => {
  api.defaults.adapter = async (config) => {
    requests.push(config);
    if (config.method === 'delete') throw new AxiosError('Network error', 'ERR_NETWORK');
    return resposta(200, { data: imovelFixture }, config);
  };

  const { goBacks } = await montarDetalhe(7);
  const botaoExcluir = pressavelComTexto('Excluir anúncio');
  assert.ok(botaoExcluir);
  pressionar(botaoExcluir!);
  const alerta = ultimaChamada();

  await act(async () => { alerta.botoes[1].onPress?.(); });

  const erro = ultimaChamada();
  assert.equal(erro.titulo, 'Erro ao excluir');
  assert.equal(
    erro.mensagem,
    'Não foi possível conectar à API. Verifique sua conexão e tente novamente.',
  );
  assert.equal(goBacks.valor, 0);
});

test('detalhe com 404 exibe "Imóvel não encontrado." com opções de voltar ou tentar novamente', async () => {
  api.defaults.adapter = async (config) => {
    requests.push(config);
    assert.equal(config.method, 'get');
    throw erro404(config);
  };

  await montarDetalhe(999);
  await act(async () => {});

  const textos = textoDaTela();
  assert.ok(textos.some((t) => t.includes('Imóvel não encontrado.')));
  assert.ok(pressavelComTexto('Tentar novamente'), 'opção de tentar novamente');
  assert.ok(pressavelComTexto('Voltar'), 'opção de voltar');

  const tentar = pressavelComTexto('Tentar novamente');
  assert.ok(tentar);
  pressionar(tentar!);
  await act(async () => {});
  assert.equal(requests.length, 2, 'tentar novamente refaz o GET');
});

test('detalhe de terreno não exibe quartos, banheiros nem vagas', async () => {
  const terreno: Imovel = {
    ...imovelFixture,
    tipo: 'terreno',
    titulo: 'Terreno plano para construir',
    quartos: 0,
    banheiros: 0,
    vagas: 0,
  };
  api.defaults.adapter = async (config) => {
    requests.push(config);
    return resposta(200, { data: terreno }, config);
  };

  await montarDetalhe(7);
  await act(async () => {});

  const textos = textoDaTela();
  assert.ok(textos.some((texto) => texto.includes('Terreno plano para construir')));
  assert.ok(textos.includes('Área'), 'a área continua visível');
  assert.ok(!textos.includes('Quartos'));
  assert.ok(!textos.includes('Banheiros'));
  assert.ok(!textos.includes('Vagas'));
});

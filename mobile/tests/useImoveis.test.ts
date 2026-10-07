/// <reference types="node" />

import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useImoveis } from '../src/hooks/useImoveis';
import imovelService from '../src/services/imovelService';
import type { Imovel, PaginatedResponse } from '../src/types/imovel';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const originalList = imovelService.list;
let renderer: ReactTestRenderer | undefined;
let lista: ReturnType<typeof useImoveis>;

function Harness(): null {
  lista = useImoveis();
  return null;
}

async function montar(): Promise<void> {
  await act(async () => { renderer = create(createElement(Harness)); });
}

afterEach(async () => {
  await act(async () => { renderer?.unmount(); });
  renderer = undefined;
  imovelService.list = originalList;
});

function imovel(id: number): Imovel {
  return {
    id, titulo: `Casa ${id}`, descricao: null, tipo: 'casa', finalidade: 'venda',
    endereco: 'Rua das Palmeiras, 123', cidade: 'Praia Grande/SP', preco: 350000,
    area_m2: 120, quartos: 3, banheiros: 2, vagas: 1,
    data_disponibilidade: '2099-10-01', foto_url: null, disponivel: true,
    contato_telefone: '(13) 99999-1234', created_at: '', updated_at: '',
  };
}

function pagina(ids: number[], atual = 1, ultima = 1): PaginatedResponse<Imovel> {
  return {
    data: ids.map(imovel),
    links: { first: '', last: '', prev: null, next: atual < ultima ? '?page=2' : null },
    meta: {
      current_page: atual, last_page: ultima, per_page: 15, total: ids.length,
      from: ids.length ? 1 : null, to: ids.length || null,
    },
  };
}

function pendente<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => { resolve = resolver; });
  return { promise, resolve };
}

test('carrega dados reais do service e aceita uma lista vazia', async () => {
  const chamada = pendente<PaginatedResponse<Imovel>>();
  imovelService.list = async (filtros) => {
    assert.deepEqual(filtros, { page: 1, per_page: 15 });
    return chamada.promise;
  };
  await montar();
  assert.equal(lista.carregamento, 'inicial');
  await act(async () => { chamada.resolve(pagina([])); });
  assert.deepEqual(lista.imoveis, []);
  assert.equal(lista.carregamento, null);
  assert.equal(lista.erro, null);
  assert.equal(lista.temMais, false);
});

test('refresh volta à primeira página e substitui os anúncios', async () => {
  let chamadas = 0;
  const refresh = pendente<PaginatedResponse<Imovel>>();
  imovelService.list = async (filtros) => {
    assert.equal(filtros?.page, 1);
    return ++chamadas === 1 ? pagina([1, 2]) : refresh.promise;
  };
  await montar();
  await act(async () => { lista.atualizar(); lista.atualizar(); });
  assert.equal(chamadas, 2);
  assert.equal(lista.carregamento, 'atualizacao');
  assert.deepEqual(lista.imoveis.map(({ id }) => id), [1, 2]);
  await act(async () => { refresh.resolve(pagina([3])); });
  assert.deepEqual(lista.imoveis.map(({ id }) => id), [3]);
  assert.equal(lista.carregamento, null);
});

test('paginação evita chamadas simultâneas, IDs duplicados e páginas além do fim', async () => {
  let chamadas = 0;
  const proxima = pendente<PaginatedResponse<Imovel>>();
  imovelService.list = async (filtros) => {
    chamadas += 1;
    assert.equal(filtros?.page, chamadas);
    return chamadas === 1 ? pagina([1, 2], 1, 2) : proxima.promise;
  };
  await montar();
  await act(async () => { lista.carregarMais(); lista.carregarMais(); });
  assert.equal(chamadas, 2);
  assert.equal(lista.carregamento, 'pagina');
  await act(async () => { proxima.resolve(pagina([2, 3], 2, 2)); });
  assert.deepEqual(lista.imoveis.map(({ id }) => id), [1, 2, 3]);
  assert.equal(lista.temMais, false);
  await act(async () => { lista.carregarMais(); });
  assert.equal(chamadas, 2);
});

test('falha no refresh preserva anúncios e permite tentar novamente', async () => {
  let chamadas = 0;
  imovelService.list = async () => {
    chamadas += 1;
    if (chamadas === 2) throw new Error('Não foi possível conectar à API.');
    return pagina(chamadas === 1 ? [1] : [2]);
  };
  await montar();
  await act(async () => { lista.atualizar(); });
  assert.deepEqual(lista.imoveis.map(({ id }) => id), [1]);
  assert.equal(lista.erro, 'Não foi possível conectar à API.');
  assert.equal(lista.carregamento, null);
  await act(async () => { lista.atualizar(); });
  assert.deepEqual(lista.imoveis.map(({ id }) => id), [2]);
  assert.equal(lista.erro, null);
});

test('resposta atrasada da paginação não sobrescreve um refresh mais recente', async () => {
  let chamadas = 0;
  const antiga = pendente<PaginatedResponse<Imovel>>();
  imovelService.list = async () => {
    chamadas += 1;
    if (chamadas === 2) return antiga.promise;
    return chamadas === 1 ? pagina([1], 1, 2) : pagina([3]);
  };
  await montar();
  await act(async () => { lista.carregarMais(); });
  await act(async () => { lista.atualizar(); });
  await act(async () => { antiga.resolve(pagina([2], 2, 2)); });
  assert.deepEqual(lista.imoveis.map(({ id }) => id), [3]);
  assert.equal(lista.carregamento, null);
  assert.equal(lista.temMais, false);
});

test('desmontagem invalida consultas ainda pendentes', async () => {
  const chamada = pendente<PaginatedResponse<Imovel>>();
  imovelService.list = async () => chamada.promise;
  await montar();
  await act(async () => { renderer?.unmount(); });
  renderer = undefined;
  await act(async () => { chamada.resolve(pagina([1])); });
  assert.deepEqual(lista.imoveis, []);
});

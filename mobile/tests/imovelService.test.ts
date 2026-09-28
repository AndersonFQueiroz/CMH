/// <reference types="node" />

import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import axios, { AxiosError, AxiosHeaders, CanceledError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import api from '../src/services/api';
import imovelService from '../src/services/imovelService';
import type { CreateImovelDTO, FotoImovel, Imovel, PaginatedResponse } from '../src/types/imovel';

const foto: FotoImovel = { uri: 'file:///fachada.jpg', name: 'fachada.jpg', type: 'image/jpeg' };
const dados: CreateImovelDTO = {
  titulo: 'Casa perto da praia', tipo: 'casa', finalidade: 'venda',
  endereco: 'Rua das Palmeiras, 123', cidade: 'Praia Grande/SP',
  preco: 0, area_m2: 120.5, quartos: 0, banheiros: 0, vagas: 0,
  data_disponibilidade: '2099-10-01', contato_telefone: '(13) 99999-1234',
  disponivel: false, descricao: '',
};
const imovel: Imovel = {
  ...dados, id: 1, descricao: null, vagas: 0, disponivel: false, foto_url: null,
  created_at: '2026-09-28T12:00:00.000000Z', updated_at: '2026-09-28T12:00:00.000000Z',
};

// O FormData do Node não aceita URI de arquivo. Este substituto registra os
// valores recebidos pelo FormData nativo sem transformar a foto em string.
const originalFormData = globalThis.FormData;
class NativeFormData extends originalFormData {
  readonly parts = new Map<string, unknown>();

  override append(name: string, value: string | Blob): void {
    this.parts.set(name, value);
  }
}

let requests: InternalAxiosRequestConfig[];
let responseData: unknown;
let responseStatus: number;

beforeEach(() => {
  requests = [];
  responseData = { data: imovel };
  responseStatus = 200;
  globalThis.FormData = NativeFormData;
  api.defaults.baseURL = 'http://localhost:8000/api/v1';
  api.defaults.adapter = async (config) => {
    requests.push(config);
    return { data: responseData, status: responseStatus, statusText: 'OK', headers: new AxiosHeaders(), config };
  };
});

afterEach(() => {
  globalThis.FormData = originalFormData;
});

function request(): InternalAxiosRequestConfig {
  assert.equal(requests.length, 1);
  return requests[0];
}

function multipart(): NativeFormData {
  const config = request();
  assert.equal(config.headers.getContentType(), 'multipart/form-data');
  assert.ok(config.data instanceof NativeFormData);
  return config.data;
}

test('lista com filtros e preserva links e metadados da paginação', async () => {
  const pagina: PaginatedResponse<Imovel> = {
    data: [imovel], links: { first: '/?page=1', last: '/?page=2', prev: null, next: '/?page=2' },
    meta: { current_page: 1, from: 1, last_page: 2, per_page: 1, to: 1, total: 2 },
  };
  responseData = pagina;
  const filtros = { busca: 'Casa', cidade: 'Praia Grande/SP', disponivel: false, preco_min: 0, page: 1, per_page: 1 };
  assert.deepEqual(await imovelService.list(filtros), pagina);
  assert.equal(request().method, 'get');
  assert.equal(request().url, '/imoveis');
  const url = new URL(api.getUri(request()));
  assert.equal(url.searchParams.get('disponivel'), 'false');
  assert.equal(url.searchParams.get('preco_min'), '0');
  assert.equal(url.searchParams.get('cidade'), 'Praia Grande/SP');
  assert.equal(url.searchParams.get('per_page'), '1');
  assert.equal(request().timeout, 15000);
  assert.equal(request().headers.get('Accept'), 'application/json');
});

test('consulta o imóvel pelo ID e extrai data', async () => {
  assert.deepEqual(await imovelService.getById(1), imovel);
  assert.equal(request().method, 'get');
  assert.equal(request().url, '/imoveis/1');
});

test('cadastra sem foto em JSON preservando zero, false e descrição vazia', async () => {
  responseStatus = 201;
  assert.deepEqual(await imovelService.create(dados), imovel);
  assert.equal(request().method, 'post');
  assert.equal(request().url, '/imoveis');
  assert.equal(request().headers.getContentType(), 'application/json');
  assert.deepEqual(JSON.parse(request().data as string), dados);
});

test('cadastra com foto por URI e serializa os campos para o Laravel', async () => {
  await imovelService.create({ ...dados, foto });
  const form = multipart();
  assert.equal(request().method, 'post');
  assert.equal(request().url, '/imoveis');
  assert.deepEqual(form.parts.get('foto'), foto);
  for (const campo of ['preco', 'quartos', 'banheiros', 'vagas', 'disponivel']) {
    assert.equal(form.parts.get(campo), '0');
  }
  assert.equal(form.parts.get('descricao'), '');
  assert.equal(form.parts.get('area_m2'), '120.5');
  assert.equal(form.parts.get('data_disponibilidade'), dados.data_disponibilidade);
  assert.equal(form.parts.has('_method'), false);
});

test('atualiza campos parciais sem foto com PUT e JSON', async () => {
  const alteracoes = { preco: 0, disponivel: false, descricao: '' };
  assert.deepEqual(await imovelService.update(1, alteracoes), imovel);
  assert.equal(request().method, 'put');
  assert.equal(request().url, '/imoveis/1');
  assert.deepEqual(JSON.parse(request().data as string), alteracoes);
});

test('atualiza com foto usando POST e _method=PUT e omite campos ausentes', async () => {
  assert.deepEqual(await imovelService.update(1, { foto, disponivel: true, vagas: undefined }), imovel);
  assert.equal(request().method, 'post');
  assert.equal(request().url, '/imoveis/1');
  assert.deepEqual([...multipart().parts], [['disponivel', '1'], ['foto', foto], ['_method', 'PUT']]);
});

test('exclui e aceita resposta 204 sem corpo', async () => {
  responseStatus = 204;
  responseData = '';
  assert.equal(await imovelService.delete(1), undefined);
  assert.equal(request().method, 'delete');
  assert.equal(request().url, '/imoveis/1');
});

test('troca só a foto e lê foto_url fora do envelope data', async () => {
  responseData = { message: 'Foto do imóvel atualizada com sucesso!', foto_url: 'http://localhost/storage/imoveis/nova.jpg' };
  assert.deepEqual(await imovelService.updateFoto(1, foto), responseData);
  assert.equal(request().method, 'post');
  assert.equal(request().url, '/imoveis/1/foto');
  assert.deepEqual([...multipart().parts], [['foto', foto]]);
});

for (const [status, mensagem] of [
  [422, 'Confira os dados informados e tente novamente.'],
  [404, 'Imóvel não encontrado.'],
  [500, 'Não foi possível concluir a solicitação. Tente novamente.'],
] as const) {
  test(`trata erro ${status} em português e preserva a resposta original`, async () => {
    const body = { message: 'Erro do servidor', errors: { preco: ['O preço deve ser maior ou igual a 0.'] } };
    api.defaults.adapter = async (config) => {
      throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, {
        data: body, status, statusText: 'Error', headers: new AxiosHeaders(), config,
      });
    };
    await assert.rejects(imovelService.create(dados), (error: unknown) => {
      assert.ok(axios.isAxiosError(error));
      assert.equal(error.message, mensagem);
      assert.equal(error.response?.status, status);
      assert.deepEqual(error.response?.data, body);
      return true;
    });
  });
}

for (const code of ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT']) {
  test(`trata falha de conexão ${code}`, async () => {
    api.defaults.adapter = async () => { throw new AxiosError('Network error', code); };
    await assert.rejects(imovelService.list(), {
      message: code === 'ERR_NETWORK'
        ? 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
        : 'A conexão demorou demais. Tente novamente.',
    });
  });
}

test('mantém cancelamento identificável pelo Axios', async () => {
  api.defaults.adapter = async () => { throw new CanceledError('Cancelado'); };
  await assert.rejects(imovelService.list(), (error: unknown) => axios.isCancel(error));
});

test('informa configuração ausente antes de enviar uma requisição', async () => {
  api.defaults.baseURL = undefined;
  await assert.rejects(imovelService.list(), {
    message: 'Configure EXPO_PUBLIC_API_URL no arquivo .env para acessar a API.',
  });
  assert.equal(requests.length, 0);
});

/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AxiosError, AxiosHeaders } from 'axios';
import type { Imovel } from '../src/types/imovel';
import {
  camposAlterados,
  errosDaApi,
  montarDTO,
  validarImovelForm,
  VALORES_INICIAIS,
  valoresDoImovel,
  type ImovelFormValues,
} from '../src/utils/imovelForm';
import {
  dataBRParaISO,
  decimalParaNumero,
  hojeISO,
  mascaraData,
  mascaraDecimal,
  mascaraMoeda,
  mascaraTelefone,
  moedaParaNumero,
  numeroParaMoeda,
} from '../src/utils/masks';

const HOJE = '2026-11-09';

const validos: ImovelFormValues = {
  ...VALORES_INICIAIS,
  titulo: 'Casa perto da praia',
  tipo: 'casa',
  finalidade: 'aluguel',
  endereco: 'Rua das Palmeiras, 123',
  cidade: 'Praia Grande/SP',
  preco: 'R$ 2.500,00',
  area_m2: '120,5',
  quartos: '3',
  banheiros: '2',
  vagas: '1',
  data_disponibilidade: '01/12/2026',
  contato_telefone: '(13) 99999-1234',
};

const imovel: Imovel = {
  id: 7, titulo: 'Apartamento central', descricao: null, tipo: 'apartamento', finalidade: 'venda',
  endereco: 'Av. Ana Costa, 500', cidade: 'Santos/SP', preco: 350000.5, area_m2: 80,
  quartos: 2, banheiros: 1, vagas: 1, data_disponibilidade: '2025-01-10', foto_url: null,
  disponivel: true, contato_telefone: '(13) 3222-1234',
  created_at: '2025-01-01T00:00:00.000000Z', updated_at: '2025-01-01T00:00:00.000000Z',
};

function erro422(errors: Record<string, string[]>): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const error = new AxiosError('Confira os dados informados e tente novamente.', 'ERR_BAD_REQUEST', config);
  error.response = {
    data: { message: 'The given data was invalid.', errors },
    status: 422, statusText: 'Unprocessable Content', headers: {}, config,
  };
  return error;
}

test('máscara de telefone aceita digitação parcial e fixo/celular', () => {
  assert.equal(mascaraTelefone(''), '');
  assert.equal(mascaraTelefone('1'), '(1');
  assert.equal(mascaraTelefone('139'), '(13) 9');
  assert.equal(mascaraTelefone('1332221234'), '(13) 3222-1234');
  assert.equal(mascaraTelefone('13999991234'), '(13) 99999-1234');
  assert.equal(mascaraTelefone('(13) 99999-12345678'), '(13) 99999-1234');
});

test('máscara de data e conversão para ISO validam o calendário', () => {
  assert.equal(mascaraData('0112'), '01/12');
  assert.equal(mascaraData('01122026999'), '01/12/2026');
  assert.equal(dataBRParaISO('01/12/2026'), '2026-12-01');
  assert.equal(dataBRParaISO('31/02/2026'), null);
  assert.equal(dataBRParaISO('1/2/2026'), null);
  assert.equal(hojeISO(new Date(2026, 0, 5)), '2026-01-05');
});

test('máscara de moeda trata dígitos como centavos', () => {
  assert.equal(mascaraMoeda(''), '');
  assert.equal(mascaraMoeda('5'), 'R$ 0,05');
  assert.equal(mascaraMoeda('250000'), 'R$ 2.500,00');
  assert.equal(mascaraMoeda('R$ 2.500,001'), 'R$ 25.000,01');
  assert.equal(mascaraMoeda('000'), 'R$ 0,00');
  assert.equal(moedaParaNumero('R$ 350.000,50'), 350000.5);
  assert.equal(moedaParaNumero(''), null);
  assert.equal(numeroParaMoeda(350000.5), 'R$ 350.000,50');
  assert.equal(numeroParaMoeda(0), 'R$ 0,00');
});

test('máscara decimal aceita ponto ou vírgula com até duas casas', () => {
  assert.equal(mascaraDecimal('120.5'), '120,5');
  assert.equal(mascaraDecimal('12,345'), '12,34');
  assert.equal(mascaraDecimal('1,2,3'), '1,23');
  assert.equal(decimalParaNumero('120,5'), 120.5);
  assert.equal(decimalParaNumero('120,'), 120);
  assert.equal(decimalParaNumero(','), null);
});

test('formulário válido não gera erros e vira DTO da API', () => {
  assert.deepEqual(validarImovelForm(validos, { hoje: HOJE }), {});
  assert.deepEqual(montarDTO({ ...validos, titulo: '  Casa perto da praia  ' }), {
    titulo: 'Casa perto da praia', descricao: '', tipo: 'casa', finalidade: 'aluguel',
    endereco: 'Rua das Palmeiras, 123', cidade: 'Praia Grande/SP', preco: 2500,
    area_m2: 120.5, quartos: 3, banheiros: 2, vagas: 1, data_disponibilidade: '2026-12-01',
    contato_telefone: '(13) 99999-1234', disponivel: true,
  });
});

test('formulário vazio aponta todos os obrigatórios em português', () => {
  const erros = validarImovelForm({ ...VALORES_INICIAIS, quartos: '', banheiros: '' }, { hoje: HOJE });
  assert.deepEqual(Object.keys(erros).sort(), [
    'area_m2', 'banheiros', 'cidade', 'contato_telefone', 'data_disponibilidade',
    'endereco', 'finalidade', 'preco', 'quartos', 'tipo', 'titulo',
  ]);
  assert.equal(erros.titulo, 'O título é obrigatório.');
  assert.equal(erros.tipo, 'O tipo do imóvel é obrigatório.');
});

test('validação espelha limites e regras de domínio da API', () => {
  const erros = validarImovelForm({
    ...validos,
    titulo: 'Casa',
    area_m2: '0',
    quartos: '51',
    banheiros: '21',
    vagas: '21',
    data_disponibilidade: '08/11/2026',
    contato_telefone: '(13) 9999',
  }, { hoje: HOJE });

  assert.deepEqual(erros, {
    titulo: 'O título deve ter no mínimo 5 caracteres.',
    area_m2: 'A área deve ser maior que zero.',
    quartos: 'A quantidade de quartos deve ser no máximo 50.',
    banheiros: 'A quantidade de banheiros deve ser no máximo 20.',
    vagas: 'A quantidade de vagas deve ser no máximo 20.',
    data_disponibilidade: 'A data de disponibilidade deve ser hoje ou futura.',
    contato_telefone: 'Informe o telefone com DDD: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.',
  });
  assert.deepEqual(validarImovelForm({ ...validos, data_disponibilidade: '09/11/2026' }, { hoje: HOJE }), {});
  assert.deepEqual(validarImovelForm({ ...validos, preco: 'R$ 0,00' }, { hoje: HOJE }), {});
});

test('terreno não pode ter quartos nem banheiros', () => {
  const erros = validarImovelForm({ ...validos, tipo: 'terreno' }, { hoje: HOJE });
  assert.equal(erros.quartos, 'Um terreno não pode ter quartos.');
  assert.equal(erros.banheiros, 'Um terreno não pode ter banheiros.');
});

test('edição aceita data passada só quando ela não foi alterada', () => {
  const valores = valoresDoImovel(imovel);
  assert.equal(valores.preco, 'R$ 350.000,50');
  assert.equal(valores.area_m2, '80');
  assert.equal(valores.data_disponibilidade, '10/01/2025');

  assert.deepEqual(validarImovelForm(valores, { hoje: HOJE, dataOriginal: '2025-01-10' }), {});
  assert.equal(
    validarImovelForm({ ...valores, data_disponibilidade: '11/01/2025' }, { hoje: HOJE, dataOriginal: '2025-01-10' })
      .data_disponibilidade,
    'A data de disponibilidade deve ser hoje ou futura.',
  );
});

test('edição envia somente os campos alterados', () => {
  const valores = valoresDoImovel(imovel);
  const original = montarDTO(valores);

  assert.deepEqual(camposAlterados(original, montarDTO(valores)), {});
  assert.deepEqual(
    camposAlterados(original, montarDTO({ ...valores, preco: 'R$ 340.000,00', disponivel: false })),
    { preco: 340000, disponivel: false },
  );
});

test('erros 422 da API viram mensagens por campo', () => {
  const resultado = errosDaApi(erro422({
    titulo: ['O título deve ter no mínimo 5 caracteres.'],
    data_disponibilidade: ['A data de disponibilidade deve ser hoje ou futura.', 'outra'],
  }));

  assert.deepEqual(resultado.campos, {
    titulo: 'O título deve ter no mínimo 5 caracteres.',
    data_disponibilidade: 'A data de disponibilidade deve ser hoje ou futura.',
  });
  assert.equal(resultado.geral, 'Confira os dados informados e tente novamente.');
});

test('erro 422 da foto aparece no campo da foto', () => {
  const resultado = errosDaApi(erro422({ foto: ['A foto deve ter no máximo 2048 KB.'] }));
  assert.deepEqual(resultado.campos, { foto: 'A foto deve ter no máximo 2048 KB.' });
});

test('erros 422 de campos fora do formulário vão para a mensagem geral', () => {
  const resultado = errosDaApi(erro422({ _method: ['O método de atualização deve ser PUT ou PATCH.'] }));
  assert.deepEqual(resultado.campos, {});
  assert.equal(resultado.geral, 'O método de atualização deve ser PUT ou PATCH.');
});

test('falhas sem 422 mantêm a mensagem do interceptor', () => {
  const config = { headers: new AxiosHeaders() };
  const semRede = new AxiosError('Não foi possível conectar à API.', 'ERR_NETWORK', config);
  assert.deepEqual(errosDaApi(semRede), { campos: {}, geral: 'Não foi possível conectar à API.' });
  assert.deepEqual(errosDaApi(new Error('falhou')), { campos: {}, geral: 'falhou' });
});

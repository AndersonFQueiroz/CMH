/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fotoJpeg, LARGURA_MAXIMA_FOTO, larguraRedimensionada, resolverFotoUrl } from '../src/utils/foto';

test('só redimensiona fotos mais largas que o limite', () => {
  assert.equal(larguraRedimensionada(4032), LARGURA_MAXIMA_FOTO);
  assert.equal(larguraRedimensionada(LARGURA_MAXIMA_FOTO + 1), LARGURA_MAXIMA_FOTO);
  assert.equal(larguraRedimensionada(LARGURA_MAXIMA_FOTO), null);
  assert.equal(larguraRedimensionada(800), null);
});

test('foto comprimida vira arquivo JPEG no formato do multipart', () => {
  assert.deepEqual(fotoJpeg('file:///cache/ImageManipulator/abc.jpg', 1700000000000), {
    uri: 'file:///cache/ImageManipulator/abc.jpg',
    name: 'fachada-1700000000000.jpg',
    type: 'image/jpeg',
  });
});

test('resolverFotoUrl lida com null, undefined e reescreve localhost para backend remoto', () => {
  assert.equal(resolverFotoUrl(null), null);
  assert.equal(resolverFotoUrl(undefined), null);

  const urlExterna = 'https://meu-s3.amazonaws.com/imoveis/foto.jpg';
  assert.equal(resolverFotoUrl(urlExterna), urlExterna);

  const urlLocal = 'http://localhost:8000/storage/imoveis/foto.jpg';
  const resolvida = resolverFotoUrl(urlLocal);
  assert.ok(resolvida);
  // Se EXPO_PUBLIC_API_URL estiver apontando para Codespaces ou outro host não-localhost, deve reescrever
  if (process.env.EXPO_PUBLIC_API_URL && !process.env.EXPO_PUBLIC_API_URL.includes('localhost')) {
    assert.ok(!resolvida.includes('localhost:8000'));
    assert.ok(resolvida.endsWith('/storage/imoveis/foto.jpg'));
  }
});

/// <reference types="node" />

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fotoJpeg, LARGURA_MAXIMA_FOTO, larguraRedimensionada } from '../src/utils/foto';

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

// Regras da foto da fachada (issue #23). A API aceita JPEG/PNG/WEBP de até 2 MB;
// por isso toda foto é redimensionada e regravada como JPEG antes do envio
// (o que também converte fotos HEIC do iPhone).
import type { FotoImovel } from '../types/imovel';

export const LARGURA_MAXIMA_FOTO = 1280;
export const QUALIDADE_FOTO = 0.7;

/** Largura para redimensionar, ou `null` quando a foto já é pequena o bastante. */
export function larguraRedimensionada(largura: number): number | null {
  return largura > LARGURA_MAXIMA_FOTO ? LARGURA_MAXIMA_FOTO : null;
}

export function fotoJpeg(uri: string, agora: number = Date.now()): FotoImovel {
  return { uri, name: `fachada-${agora}.jpg`, type: 'image/jpeg' };
}

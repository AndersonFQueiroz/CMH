// Regras da foto da fachada (issue #23). A API aceita JPEG/PNG/WEBP de até 2 MB;
// por isso toda foto é redimensionada e regravada como JPEG antes do envio
// (o que também converte fotos HEIC do iPhone).
import type { FotoImovel } from '../types/imovel';
import { resolveApiBaseUrl } from '../services/api';

export const LARGURA_MAXIMA_FOTO = 1280;
export const QUALIDADE_FOTO = 0.7;

/** Largura para redimensionar, ou `null` quando a foto já é pequena o bastante. */
export function larguraRedimensionada(largura: number): number | null {
  return largura > LARGURA_MAXIMA_FOTO ? LARGURA_MAXIMA_FOTO : null;
}

export function fotoJpeg(uri: string, agora: number = Date.now()): FotoImovel {
  return { uri, name: `fachada-${agora}.jpg`, type: 'image/jpeg' };
}

/**
 * Normaliza URLs de fotos retornadas pelo backend.
 * Quando rodando em ambiente externo/web (ex: Codespaces), a API pode retornar
 * 'http://localhost:8000/storage/...', que causa erro de conexão/mixed-content no navegador.
 */
export function resolverFotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
  const isRelative = url.startsWith('/');

  if (isLocalhost || isRelative) {
    const apiBase = resolveApiBaseUrl();
    if (apiBase) {
      const backendOrigin = apiBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
      if (backendOrigin && !backendOrigin.includes('localhost') && !backendOrigin.includes('127.0.0.1')) {
        if (isRelative) {
          return `${backendOrigin}${url}`;
        }
        return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, backendOrigin);
      }
    }
  }

  return url;
}

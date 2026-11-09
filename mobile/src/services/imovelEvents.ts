import type { Imovel } from '../types/imovel';

type ImovelSalvoListener = (imovel: Imovel) => void;

const listeners = new Set<ImovelSalvoListener>();

/** Avisa as telas abertas (lista e detalhe) que um anúncio foi criado ou editado. */
export function notificarImovelSalvo(imovel: Imovel): void {
  for (const listener of listeners) listener(imovel);
}

/** Retorna a função que cancela a inscrição. */
export function onImovelSalvo(listener: ImovelSalvoListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

import type { Imovel } from '../types/imovel';

type ImovelSalvoListener = (imovel: Imovel) => void;
type ImovelExcluidoListener = (id: number) => void;

const salvos = new Set<ImovelSalvoListener>();
const excluidos = new Set<ImovelExcluidoListener>();

/** Avisa as telas abertas (lista e detalhe) que um anúncio foi criado ou editado. */
export function notificarImovelSalvo(imovel: Imovel): void {
  for (const listener of salvos) listener(imovel);
}

/** Retorna a função que cancela a inscrição. */
export function onImovelSalvo(listener: ImovelSalvoListener): () => void {
  salvos.add(listener);
  return () => {
    salvos.delete(listener);
  };
}

/** Avisa as telas abertas que um anúncio foi excluído pela API. */
export function notificarImovelExcluido(id: number): void {
  for (const listener of excluidos) listener(id);
}

/** Retorna a função que cancela a inscrição. */
export function onImovelExcluido(listener: ImovelExcluidoListener): () => void {
  excluidos.add(listener);
  return () => {
    excluidos.delete(listener);
  };
}

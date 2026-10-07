import { useCallback, useEffect, useRef, useState } from 'react';
import imovelService from '../services/imovelService';
import type { Imovel } from '../types/imovel';

type Carregamento = 'inicial' | 'atualizacao' | 'pagina';

interface UseImoveisResult {
  imoveis: Imovel[];
  carregamento: Carregamento | null;
  erro: string | null;
  temMais: boolean;
  atualizar: () => void;
  carregarMais: () => void;
}

export function useImoveis(): UseImoveisResult {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregamento, setCarregamento] = useState<Carregamento | null>('inicial');
  const [erro, setErro] = useState<string | null>(null);
  const [temMais, setTemMais] = useState(false);
  const paginaAtual = useRef(0);
  const ultimaPagina = useRef(0);
  const requisicao = useRef(0);
  const emAndamento = useRef<Carregamento | null>(null);

  const carregar = useCallback(async (modo: Carregamento) => {
    if (modo === 'pagina' && (emAndamento.current || paginaAtual.current >= ultimaPagina.current)) return;
    if (modo === 'atualizacao' && emAndamento.current === 'atualizacao') return;
    const id = ++requisicao.current;
    const pagina = modo === 'pagina' ? paginaAtual.current + 1 : 1;
    emAndamento.current = modo;
    setCarregamento(modo);
    setErro(null);
    try {
      const resposta = await imovelService.list({ page: pagina, per_page: 15 });
      // Atualizar a lista ou desmontar a tela invalida respostas anteriores.
      if (id !== requisicao.current) return;
      setImoveis((atuais) => modo === 'pagina'
        ? [...new Map([...atuais, ...resposta.data].map((imovel) => [imovel.id, imovel])).values()]
        : resposta.data);
      paginaAtual.current = resposta.meta.current_page;
      ultimaPagina.current = resposta.meta.last_page;
      setTemMais(resposta.meta.current_page < resposta.meta.last_page);
    } catch (error: unknown) {
      if (id !== requisicao.current) return;
      setErro(error instanceof Error ? error.message : 'Não foi possível carregar os imóveis. Tente novamente.');
    } finally {
      if (id === requisicao.current) {
        emAndamento.current = null;
        setCarregamento(null);
      }
    }
  }, []);

  useEffect(() => {
    void carregar('inicial');
    return () => {
      requisicao.current += 1;
      emAndamento.current = null;
    };
  }, [carregar]);

  const atualizar = useCallback(() => { void carregar('atualizacao'); }, [carregar]);
  const carregarMais = useCallback(() => { void carregar('pagina'); }, [carregar]);
  return { imoveis, carregamento, erro, temMais, atualizar, carregarMais };
}

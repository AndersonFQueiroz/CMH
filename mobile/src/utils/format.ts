// RASCUNHO (#15/#16, navegação apenas): helpers de exibição para os mocks.
// Tipos canônicos de domínio chegam na #17; formulário real com
// máscaras chega na #22. Não expandir este arquivo nas issues atuais.
export type FinalidadeRascunho = 'venda' | 'aluguel';

export function formatPreco(
  preco: number,
  finalidade: FinalidadeRascunho,
): string {
  const base = preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  return finalidade === 'aluguel' ? `${base}/mês` : base;
}

export function formatArea(areaM2: number): string {
  return `${areaM2.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} m²`;
}

export function formatDataBR(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function formatTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return telefone;
}

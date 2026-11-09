// Máscaras de entrada do formulário de imóvel (issue #22, RF-13).
// Implementadas sem Intl para terem o mesmo resultado em Hermes, web e testes.

const MAX_DIGITOS_MOEDA = 13;

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

function separarMilhares(inteiro: string): string {
  return inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** `13999991234` → `(13) 99999-1234`; aceita digitação parcial. */
export function mascaraTelefone(texto: string): string {
  const digitos = somenteDigitos(texto).slice(0, 11);
  if (digitos.length === 0) return '';
  if (digitos.length <= 2) return `(${digitos}`;

  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  const corte = digitos.length === 11 ? 5 : 4;
  if (numero.length <= corte) return `(${ddd}) ${numero}`;
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}

/** `01102026` → `01/10/2026`; aceita digitação parcial. */
export function mascaraData(texto: string): string {
  const digitos = somenteDigitos(texto).slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

/** Os dígitos digitados são centavos: `250000` → `R$ 2.500,00`. */
export function mascaraMoeda(texto: string): string {
  const digitos = somenteDigitos(texto).replace(/^0+(?=\d)/, '').slice(0, MAX_DIGITOS_MOEDA);
  if (digitos.length === 0) return '';

  const centavos = digitos.padStart(3, '0');
  const inteiro = centavos.slice(0, -2);
  return `R$ ${separarMilhares(inteiro)},${centavos.slice(-2)}`;
}

export function moedaParaNumero(texto: string): number | null {
  const digitos = somenteDigitos(texto);
  return digitos.length === 0 ? null : Number(digitos) / 100;
}

export function numeroParaMoeda(valor: number): string {
  return mascaraMoeda(Math.round(valor * 100).toString());
}

/** Mantém dígitos e uma vírgula com até 2 casas: `120.5` → `120,5`. */
export function mascaraDecimal(texto: string): string {
  const normalizado = texto.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [inteiro = '', ...resto] = normalizado.split(',');
  if (resto.length === 0) return inteiro;
  return `${inteiro},${resto.join('').slice(0, 2)}`;
}

export function decimalParaNumero(texto: string): number | null {
  const normalizado = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalizado) && !/^\d+\.$/.test(normalizado)) return null;
  return Number(normalizado);
}

export function numeroParaDecimal(valor: number): string {
  return String(valor).replace('.', ',');
}

export function mascaraInteiro(texto: string, maxDigitos = 2): string {
  return somenteDigitos(texto).slice(0, maxDigitos);
}

/** `01/10/2026` → `2026-10-01`, ou `null` se a data não existir no calendário. */
export function dataBRParaISO(texto: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!match) return null;

  const [, dia, mes, ano] = match;
  const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
  const valida =
    data.getUTCFullYear() === Number(ano) &&
    data.getUTCMonth() === Number(mes) - 1 &&
    data.getUTCDate() === Number(dia);
  return valida ? `${ano}-${mes}-${dia}` : null;
}

/** `2026-10-01` ou `2026-10-01T00:00:00Z` → `01/10/2026`. */
export function isoParaDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split('T')[0].split('-');
  if (!ano || !mes || !dia) return '';
  return `${dia}/${mes}/${ano}`;
}

/** Data local de hoje em `YYYY-MM-DD`. */
export function hojeISO(agora: Date = new Date()): string {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

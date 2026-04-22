/**
 * Cálculo do Saque-Aniversário do FGTS 2026
 * Alíquotas por faixa de saldo + parcela adicional (Lei 13.932/2019, Circular Caixa nº 889/2020)
 * Valores da tabela oficial da Caixa Econômica Federal.
 */

export interface Inputs {
  saldoFgts: number | string;
  mesNascimento?: number | string;
}

export interface Outputs {
  valorSaque: string;
  aliquotaFaixa: string;
  parcelaAdicional: string;
  saldoRemanescente: string;
  mesSaque: string;
  resumen: string;
}

interface Faixa {
  ate: number;
  aliquota: number;
  adicional: number;
}

const TABELA: Faixa[] = [
  { ate: 500, aliquota: 0.50, adicional: 0 },
  { ate: 1000, aliquota: 0.40, adicional: 50 },
  { ate: 5000, aliquota: 0.30, adicional: 150 },
  { ate: 10000, aliquota: 0.20, adicional: 650 },
  { ate: 15000, aliquota: 0.15, adicional: 1150 },
  { ate: 20000, aliquota: 0.10, adicional: 1900 },
  { ate: Infinity, aliquota: 0.05, adicional: 2900 },
];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fgtsSaqueAniversario(i: Inputs): Outputs {
  const saldo = Number(i.saldoFgts) || 0;
  const mes = Number(i.mesNascimento) || 1;

  if (saldo <= 0) {
    throw new Error('Informe um saldo de FGTS válido (maior que zero).');
  }

  const faixa = TABELA.find(f => saldo <= f.ate)!;
  const valorSaque = saldo * faixa.aliquota + faixa.adicional;
  const saldoRemanescente = saldo - valorSaque;
  const mesIdx = Math.min(12, Math.max(1, Math.round(mes))) - 1;

  return {
    valorSaque: brl(valorSaque),
    aliquotaFaixa: (faixa.aliquota * 100).toFixed(0) + '%',
    parcelaAdicional: brl(faixa.adicional),
    saldoRemanescente: brl(saldoRemanescente),
    mesSaque: MESES[mesIdx],
    resumen: `Com saldo de ${brl(saldo)} você pode sacar ${brl(valorSaque)} em ${MESES[mesIdx]} (${(faixa.aliquota * 100).toFixed(0)}% + parcela adicional de ${brl(faixa.adicional)}).`,
  };
}

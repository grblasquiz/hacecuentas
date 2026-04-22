/**
 * Financiamento Caixa — Linha IPCA + 3,95% aa
 * Correção monetária mensal pelo IPCA + juros fixos. Usa SAC.
 * IPCA estimado 2026: 4,5% aa (padrão editável).
 */

export interface Inputs {
  valorImovel: number | string;
  entrada: number | string;
  prazoMeses: number | string;
  ipca: number | string; // IPCA anual estimado em % (padrão 4,5)
}

export interface Outputs {
  valorFinanciado: string;
  taxaEfetivaAnual: string;
  primeiraParcela: string;
  ultimaParcela: string;
  totalPago: string;
  totalJuros: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function financiamentoCaixaIpca(i: Inputs): Outputs {
  const valor = Number(i.valorImovel) || 0;
  const entrada = Number(i.entrada) || 0;
  const n = Math.round(Number(i.prazoMeses) || 0);
  const ipca = Number(i.ipca) || 4.5;

  if (valor <= 0 || n <= 0) {
    throw new Error('Informe valor do imóvel e prazo válidos.');
  }
  const pv = valor - entrada;
  if (pv <= 0) {
    throw new Error('A entrada não pode ser maior ou igual ao valor do imóvel.');
  }

  // Caixa IPCA + 3,95%
  const jurosFixo = 3.95;
  const taxaNominalAnual = ipca + jurosFixo;
  const im = Math.pow(1 + taxaNominalAnual / 100, 1 / 12) - 1;

  // SAC com correção monetária aplicada mês a mês
  const amort = pv / n;
  let saldo = pv;
  let totalPago = 0;
  let primeira = 0;
  let ultima = 0;
  for (let k = 1; k <= n; k++) {
    const juros = saldo * im;
    const parcela = amort + juros;
    totalPago += parcela;
    if (k === 1) primeira = parcela;
    if (k === n) ultima = parcela;
    saldo -= amort;
  }

  const totalJuros = totalPago - pv;

  return {
    valorFinanciado: brl(pv),
    taxaEfetivaAnual: taxaNominalAnual.toFixed(2) + '% aa (IPCA + 3,95%)',
    primeiraParcela: brl(primeira),
    ultimaParcela: brl(ultima),
    totalPago: brl(totalPago),
    totalJuros: brl(totalJuros),
    resumen: `Linha IPCA Caixa: IPCA (${ipca}%) + 3,95% = ${taxaNominalAnual.toFixed(2)}% aa nominal. Em ${n} meses (SAC), 1ª parcela ${brl(primeira)}, última ${brl(ultima)}, juros totais ${brl(totalJuros)}.`,
  };
}

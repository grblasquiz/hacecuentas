/**
 * CET — Custo Efetivo Total de empréstimo pessoal.
 * Resolução CMN 3.517/2007: CET inclui juros + IOF + tarifas + seguros.
 * Cálculo da taxa interna de retorno (TIR) mensal + anualização.
 */

export interface Inputs {
  valorLiberado: number | string;       // R$ efetivamente recebido
  parcelaMensal: number | string;       // R$
  numeroParcelas: number | string;
  iofValor?: number | string;
  tarifas?: number | string;
  seguros?: number | string;
  taxaJurosMensal?: number | string;    // opcional, informativo
}

export interface Outputs {
  cetMensal: string;
  cetAnual: string;
  totalPago: string;
  custoTotal: string;
  jurosPagos: string;
  encargosExtras: string;
  resumen: string;
}

function brl(n: number): string {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// TIR via bisseção para fluxos: -VP no tempo 0, +PMT em 1..n
function tirMensal(vp: number, pmt: number, n: number): number {
  let lo = 0.00001, hi = 2.0; // 0% a 200% am
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    // VP = PMT × (1 - (1+i)^-n) / i
    const calc = pmt * (1 - Math.pow(1 + mid, -n)) / mid;
    if (calc > vp) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export function cetEmprestimoPessoal(i: Inputs): Outputs {
  const liberado = Number(i.valorLiberado) || 0;
  const pmt = Number(i.parcelaMensal) || 0;
  const n = Number(i.numeroParcelas) || 0;
  const iof = Number(i.iofValor ?? 0) || 0;
  const tarifas = Number(i.tarifas ?? 0) || 0;
  const seguros = Number(i.seguros ?? 0) || 0;

  if (liberado <= 0) throw new Error('Informe o valor liberado.');
  if (pmt <= 0) throw new Error('Informe o valor da parcela.');
  if (n <= 0) throw new Error('Informe o número de parcelas.');

  // O dinheiro que efetivamente entrou no bolso = liberado - iof - tarifas - seguros
  // (encargos pagos na origem reduzem o valor útil)
  const liquidoRecebido = liberado - iof - tarifas - seguros;

  const cetMes = tirMensal(liquidoRecebido, pmt, n);
  const cetAno = Math.pow(1 + cetMes, 12) - 1;

  const totalPago = pmt * n;
  const custoTotal = totalPago - liquidoRecebido;
  const encargosExtras = iof + tarifas + seguros;
  const jurosPagos = totalPago - liberado;

  return {
    cetMensal: (cetMes * 100).toFixed(2) + '% am',
    cetAnual: (cetAno * 100).toFixed(2) + '% aa',
    totalPago: brl(totalPago),
    custoTotal: brl(custoTotal),
    jurosPagos: brl(jurosPagos),
    encargosExtras: brl(encargosExtras),
    resumen: `Empréstimo com ${brl(liquidoRecebido)} líquido e ${n}x de ${brl(pmt)}: CET ${(cetAno * 100).toFixed(2)}% aa (${(cetMes * 100).toFixed(2)}% am). Custo total ${brl(custoTotal)}.`,
  };
}

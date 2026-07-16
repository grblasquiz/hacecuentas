/**
 * Certificados de Aforro Série F (IGCP) — projeção de rendimento (Portugal 2026).
 * Taxa base = média da Euribor a 3 meses (10 dias úteis), piso 0 %, teto 2,5 %.
 * A partir do 2.º ano soma-se o prémio de permanência (fora do teto). Capitalização
 * trimestral. Juros sujeitos a 28 % de IRS (retenção). Unidade = 1 €; máx. 250.000 €.
 * A taxa base é um input (varia mensalmente); os prémios e a mecânica ficam aqui.
 */
import { fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  montante: number;             // capital investido (€), 1 unidade = 1 €
  anos: number;                 // prazo (1 a 15)
  taxaBase?: number;            // taxa base anual bruta (%), teto 2,5. Default 2,0.
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

const TETO_BASE = 2.5;   // teto da taxa base (%)
const IRS_JUROS = 0.28;  // retenção de IRS sobre juros (%)
const LIMITE_MAX = 250000;

// Prémio de permanência por ano (pontos percentuais somados à taxa base).
function premioPermanencia(ano: number): number {
  if (ano <= 1) return 0;
  if (ano <= 5) return 0.25;   // 2.º–5.º ano
  if (ano <= 9) return 0.50;   // 6.º–9.º ano
  if (ano <= 11) return 1.00;  // 10.º–11.º ano
  if (ano <= 13) return 1.50;  // 12.º–13.º ano
  return 1.75;                 // 14.º–15.º ano
}

export function compute(i: Inputs): Outputs {
  const montante = Math.max(0, Number(i.montante) || 0);
  const anos = Math.min(15, Math.max(1, Math.floor(Number(i.anos) || 1)));
  const baseInput = Number(i.taxaBase);
  const taxaBase = Math.min(TETO_BASE, Number.isFinite(baseInput) ? Math.max(0, baseInput) : 2.0);
  if (montante <= 0) throw new Error('Indique o montante a investir (€)');

  const acimaLimite = montante > LIMITE_MAX;

  // Capitalização trimestral, ano a ano, somando o prémio de permanência de cada ano.
  let saldo = montante;
  for (let ano = 1; ano <= anos; ano++) {
    const taxaAno = (taxaBase + premioPermanencia(ano)) / 100;
    const taxaTri = taxaAno / 4;
    saldo = saldo * Math.pow(1 + taxaTri, 4);
  }

  const valorFinalBruto = saldo;
  const jurosBrutos = Math.max(0, valorFinalBruto - montante);
  const irs = jurosBrutos * IRS_JUROS;
  const valorFinalLiquido = montante + jurosBrutos - irs;
  const taxaMediaLiquida = montante > 0 && anos > 0
    ? (Math.pow(valorFinalLiquido / montante, 1 / anos) - 1) * 100
    : 0;
  const taxaMediaStr = taxaMediaLiquida.toLocaleString('de-DE', { maximumFractionDigits: 2 });

  const _table = {
    title: 'Projeção do investimento',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Montante investido', fmtEUR(montante)],
      ['Prazo', `${anos} ano${anos === 1 ? '' : 's'}`],
      ['Taxa base anual', `${taxaBase.toLocaleString('de-DE', { maximumFractionDigits: 3 })} %`],
      ['Valor final bruto', fmtEUR(valorFinalBruto)],
      ['Juros brutos', fmtEUR(jurosBrutos)],
      ['IRS (28 %)', `− ${fmtEUR(irs)}`],
      ['Valor final líquido', fmtEUR(valorFinalLiquido)],
    ],
    note: 'Capitalização trimestral. Prémio de permanência somado à taxa base (fora do teto de 2,5 %). Taxa base mantida constante na projeção — na realidade varia mensalmente com a Euribor.',
  };

  const _insight = {
    title: `Rende ${fmtEUR(jurosBrutos - irs)} líquidos em ${anos} ano${anos === 1 ? '' : 's'}`,
    text: `Investindo **${fmtEUR(montante)}** a uma taxa base de **${taxaBase.toLocaleString('de-DE', { maximumFractionDigits: 2 })} %**, ao fim de **${anos} ano${anos === 1 ? '' : 's'}** tem **${fmtEUR(valorFinalLiquido)}** líquidos ` +
      `(${fmtEUR(jurosBrutos)} de juros − ${fmtEUR(irs)} de IRS). Rentabilidade líquida média ~**${taxaMediaStr} %/ano**. ` +
      `O prémio de permanência premeia quem fica: sobe para +0,50 pp ao 6.º ano e até +1,75 pp ao 14.º.` +
      (acimaLimite ? ` ⚠️ O montante excede o limite de 250.000 € por titular da Série F.` : ''),
    tone: acimaLimite ? 'warn' : 'good',
    icon: '💰',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(montante) },
      { label: 'Juros líquidos', value: Math.round(jurosBrutos - irs) },
      { label: 'IRS', value: Math.round(irs) },
    ].filter((s) => s.value > 0),
    prefix: '€ ',
    centerValue: fmtEUR(valorFinalLiquido),
    centerLabel: 'Líquido',
    ariaLabel: `Investindo ${fmtEUR(montante)}: valor final líquido ${fmtEUR(valorFinalLiquido)}, juros líquidos ${fmtEUR(jurosBrutos - irs)}, IRS ${fmtEUR(irs)}.`,
  };

  return {
    valorFinalLiquido: fmtEUR(valorFinalLiquido),
    valorFinalBruto: fmtEUR(valorFinalBruto),
    jurosBrutos: fmtEUR(jurosBrutos),
    irs: fmtEUR(irs),
    taxaMediaLiquida: `${taxaMediaStr} %`,
    detalhe: `${fmtEUR(montante)} a ${taxaBase.toLocaleString('de-DE', { maximumFractionDigits: 2 })} % base durante ${anos} ano${anos === 1 ? '' : 's'} → ${fmtEUR(valorFinalLiquido)} líquidos (${fmtEUR(jurosBrutos)} juros − ${fmtEUR(irs)} IRS).`,
    _insight,
    _table,
    _chart,
  };
}

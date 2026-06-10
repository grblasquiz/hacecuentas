/** PJ vs CLT — Comparador líquido mensal (Brasil 2026)
 *  CLT: salário - INSS - IRRF + FGTS (8%) + multa FGTS proporcional (40% × 8% / 12) + férias (1/3 × 1/12) + 13º (1/12) + plano R$500 + VT + VR
 *  PJ: faturamento - DAS (Simples Anexo III efetivo) - contador - INSS pro-labore - IRRF pro-labore - sem benefícios
 *  INSS/IRRF 2026: fonte única src/lib/data/brasil-2026.ts (teto INSS R$ 8.475,55;
 *  IRRF tabela mai/2025 + redutor 2026 da reforma). Pró-labore mínimo = salário mínimo 2026 (R$ 1.621).
 */

import { calcINSS, calcIRRF2026, SALARIO_MINIMO } from '../data/brasil-2026';

export interface Inputs {
  salarioClt: number;
  faturamentoPj: number;
  planoSaude?: number;
  valeRefeicao?: number;
  valeTransporte?: number;
  custoContador?: number;
  aliquotaSimples?: number;
}

export interface Outputs {
  cltLiquido: number;
  cltTotalBeneficios: number;
  pjLiquido: number;
  diferencaMensal: number;
  diferencaAnual: number;
  vencedor: string;
  detalhe: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

// INSS progressivo e IRRF (tabela cheia + redutor 2026): implementação única
// em src/lib/data/brasil-2026.ts, compartilhada com o simulador de holerite.
const inssClt = calcINSS;
const calcIrrf = calcIRRF2026;

export function pjVsCltComparador(i: Inputs): Outputs {
  const salClt = Math.max(0, Number(i.salarioClt) || 0);
  const fatPj = Math.max(0, Number(i.faturamentoPj) || 0);
  const plano = Number(i.planoSaude) || 500;
  const vr = Number(i.valeRefeicao) || 600;
  const vt = Number(i.valeTransporte) || 220;
  const contador = Number(i.custoContador) || 400;
  const aliqSimples = Number(i.aliquotaSimples) || 6;

  // CLT
  const inssC = inssClt(salClt);
  const baseIrrfC = salClt - inssC;
  const irrfC = calcIrrf(baseIrrfC);
  const cltLiqBase = salClt - inssC - irrfC;
  // Benefícios monetários mensais
  const fgtsMensal = salClt * 0.08;
  const multaFgtsProv = fgtsMensal * 0.40; // provisão multa 40%
  const decimoTerceiro = salClt / 12;
  const feriasTerco = (salClt * (1 / 3)) / 12;
  const cltTotalBeneficios = fgtsMensal + multaFgtsProv + decimoTerceiro + feriasTerco + plano + vr + vt;
  const cltLiquido = cltLiqBase + cltTotalBeneficios;

  // PJ
  const das = fatPj * (aliqSimples / 100);
  // Assume pro-labore mínimo para atender lei (igual ao salário mínimo 2026, R$ 1.621)
  const proLabore = SALARIO_MINIMO;
  const inssProLab = proLabore * 0.11;
  // IRRF sobre pro-labore (geralmente isento pela faixa)
  const irrfProLab = calcIrrf(proLabore - inssProLab);
  const pjLiquido = fatPj - das - contador - inssProLab - irrfProLab;

  const diferencaMensal = pjLiquido - cltLiquido;
  const diferencaAnual = diferencaMensal * 12;
  const vencedor = diferencaMensal > 0 ? 'PJ' : 'CLT';

  const detalhe = `CLT: salário R$ ${salClt.toFixed(2)} - INSS R$ ${inssC.toFixed(2)} - IRRF R$ ${irrfC.toFixed(2)} + benefícios R$ ${cltTotalBeneficios.toFixed(2)} (FGTS+multa+13º+férias+plano+VT+VR) = R$ ${cltLiquido.toFixed(2)}. PJ: faturamento R$ ${fatPj.toFixed(2)} - DAS (${aliqSimples}%) R$ ${das.toFixed(2)} - contador R$ ${contador.toFixed(2)} - INSS pró-labore R$ ${inssProLab.toFixed(2)} - IRRF R$ ${irrfProLab.toFixed(2)} = R$ ${pjLiquido.toFixed(2)}.`;
  const formula = `PJ líquido - CLT líquido equivalente = R$ ${pjLiquido.toFixed(2)} - R$ ${cltLiquido.toFixed(2)} = R$ ${diferencaMensal.toFixed(2)}/mês`;
  const explicacion = `Comparação CLT R$ ${salClt.toFixed(2)} vs PJ R$ ${fatPj.toFixed(2)} (faturamento bruto). ${detalhe} Diferença mensal: R$ ${diferencaMensal.toFixed(2)} (${vencedor} ganha). Diferença anual: R$ ${diferencaAnual.toFixed(2)}. Lembre-se: PJ NÃO tem FGTS, férias remuneradas, 13º, auxílio-doença INSS completo nem seguro-desemprego — estabilidade financeira é menor. Regra prática: PJ precisa ganhar ~30-40% a mais bruto para empatar em termos reais.`;

  const absMensal = Math.abs(diferencaMensal);
  const fmt = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const _insight = {
    title: vencedor === 'PJ' ? 'PJ rende mais por mês' : 'CLT rende mais por mês',
    text: vencedor === 'PJ'
      ? `Como **PJ** você fica com **R$ ${fmt(pjLiquido)}/mês** contra **R$ ${fmt(cltLiquido)}** no CLT equivalente: **R$ ${fmt(absMensal)} a mais** (R$ ${fmt(Math.abs(diferencaAnual))}/ano). Mas o CLT já inclui FGTS, 13º e férias — como PJ você precisa reservar isso por conta própria.`
      : `O **CLT** equivalente rende **R$ ${fmt(cltLiquido)}/mês** contra **R$ ${fmt(pjLiquido)}** como PJ: **R$ ${fmt(absMensal)} a mais** (R$ ${fmt(Math.abs(diferencaAnual))}/ano), já contando FGTS, 13º, férias e benefícios. Aumentar o faturamento PJ ou negociar a alíquota muda o resultado.`,
    tone: vencedor === 'PJ' ? 'good' : 'warn',
    icon: '⚖️',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salário líquido', value: Number(cltLiqBase.toFixed(2)) },
      { label: 'FGTS + multa 40%', value: Number((fgtsMensal + multaFgtsProv).toFixed(2)) },
      { label: '13º + férias', value: Number((decimoTerceiro + feriasTerco).toFixed(2)) },
      { label: 'Plano + VR + VT', value: Number((plano + vr + vt).toFixed(2)) },
    ],
    prefix: 'R$ ',
    centerValue: `R$ ${fmt(cltLiquido)}`,
    centerLabel: 'CLT total/mês',
    ariaLabel: `Composição do valor total do CLT por mês: salário líquido, FGTS com multa, 13º e férias, e benefícios, somando R$ ${fmt(cltLiquido)}.`,
  };
  return {
    cltLiquido: Number(cltLiquido.toFixed(2)),
    cltTotalBeneficios: Number(cltTotalBeneficios.toFixed(2)),
    pjLiquido: Number(pjLiquido.toFixed(2)),
    diferencaMensal: Number(diferencaMensal.toFixed(2)),
    diferencaAnual: Number(diferencaAnual.toFixed(2)),
    vencedor,
    detalhe,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}

/** PJ vs CLT — Comparador líquido mensal (Brasil 2026)
 *  CLT: salário - INSS - IRRF + FGTS (8%) + multa FGTS proporcional (40% × 8% / 12) + férias (1/3 × 1/12) + 13º (1/12) + plano R$500 + VT + VR
 *  PJ: faturamento - DAS (Simples Anexo III efetivo) - contador - INSS pro-labore - IRRF pro-labore - sem benefícios
 */

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
}

const TETO_INSS = 8157.41;
const IRRF = [
  { lim: 2259.20, aliq: 0, deduz: 0 },
  { lim: 2826.65, aliq: 7.5, deduz: 169.44 },
  { lim: 3751.05, aliq: 15.0, deduz: 381.44 },
  { lim: 4664.68, aliq: 22.5, deduz: 662.77 },
  { lim: Infinity, aliq: 27.5, deduz: 896.00 },
];

function inssClt(sal: number): number {
  // Progressivo 2026: até 1518 = 7.5%; até 2793.88 = 9%; até 4190.83 = 12%; até 8157.41 = 14% (cálculo por faixa)
  const faixas = [
    { lim: 1518.00, aliq: 0.075 },
    { lim: 2793.88, aliq: 0.09 },
    { lim: 4190.83, aliq: 0.12 },
    { lim: 8157.41, aliq: 0.14 },
  ];
  let contrib = 0;
  let prev = 0;
  for (const f of faixas) {
    if (sal > prev) {
      const base = Math.min(sal, f.lim) - prev;
      contrib += base * f.aliq;
      prev = f.lim;
    }
  }
  return contrib;
}

function calcIrrf(base: number): number {
  if (base <= 0) return 0;
  for (const f of IRRF) if (base <= f.lim) return Math.max(0, base * (f.aliq / 100) - f.deduz);
  return 0;
}

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
  // Assume pro-labore mínimo para atender lei (igual ao salário mínimo 1518)
  const proLabore = 1518;
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
  };
}

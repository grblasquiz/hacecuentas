/**
 * Simulador de holerite CLT INTEGRAL (Brasil) — multicálculo em PT-BR.
 * Um salário bruto → 5 cálculos de uma vez:
 *   1. Salário líquido mensal (INSS progressivo 2026 + IRRF com redutor da reforma)
 *   2. 13º salário líquido
 *   3. Férias (salário + 1/3 constitucional, líquido)
 *   4. FGTS depositado pelo empregador (8%, mensal e anual)
 *   5. Custo do empregador (estimativa mínima, fora do Simples)
 *
 * Dados: INSS importado de src/lib/data/brasil-2026.ts (fonte única verificada,
 * teto R$ 8.475,55). IRRF: tabela progressiva vigente desde mai/2025 + redutor
 * 2026 (Lei 14.663/2023 e reforma — isenção efetiva até R$ 5.000 de base,
 * redução linear até R$ 7.350; aproximação documentada).
 *
 * HUB: enlaça as calcs dedicadas (salário líquido, 13º, férias, FGTS) sem
 * competir — a intenção aqui é "holerite completo / quanto custo e quanto levo".
 */

import { calcINSS, IRRF_DEDUCAO_DEPENDENTE } from '../data/brasil-2026';

export interface Inputs {
  salarioBruto: number;
  dependentes?: number | string;
  __lang?: string;
}

export interface Outputs {
  liquidoMensal: number;
  inss: number;
  irrf: number;
  decimoLiquido: number;
  feriasLiquido: number;
  fgtsMensal: number;
  fgtsAnual: number;
  liquidoAnual: number;
  custoEmpregadorMensal: number;
  _chart?: any;
  _insight?: any;
}

// Tabela IRRF mensal vigente desde 05/2025 (IN RFB): alíquota e parcela a deduzir.
function irrfTabela(base: number): number {
  if (base <= 2428.8) return 0;
  if (base <= 2826.65) return base * 0.075 - 182.16;
  if (base <= 3751.05) return base * 0.15 - 394.16;
  if (base <= 4664.68) return base * 0.225 - 675.49;
  return base * 0.275 - 908.73;
}

// Redutor 2026: IR zerado até base de R$ 5.000; redução linear até R$ 7.350
// (aproximação da regra de transição da reforma). Acima, tabela cheia.
function calcIrrf2026(base: number): number {
  if (base <= 5000) return 0;
  const cheio = irrfTabela(base);
  if (base >= 7350) return Math.max(0, cheio);
  const fator = (base - 5000) / (7350 - 5000);
  return Math.max(0, cheio * fator);
}

const FGTS_ALIQ = 0.08;
// Custo do empregador (mínimo): INSS patronal 20% + FGTS 8% = 28%.
// Não inclui RAT (1–3%) nem Sistema S/terceiros (~5,8%), que variam por CNAE.
const CUSTO_EMPREGADOR_MIN = 0.28;

export function simuladorHoleriteClt(i: Inputs): Outputs {
  const bruto = Number(i.salarioBruto);
  if (!bruto || bruto <= 0) throw new Error('Informe o salário bruto mensal');
  const dep = Math.max(0, Math.min(10, Number(i.dependentes) || 0));

  const liquidoDe = (brutoBase: number) => {
    const inss = calcINSS(brutoBase);
    const baseIr = Math.max(0, brutoBase - inss - dep * IRRF_DEDUCAO_DEPENDENTE);
    const irrf = calcIrrf2026(baseIr);
    return { inss, irrf, liquido: brutoBase - inss - irrf };
  };

  // 1. Mensal
  const mensal = liquidoDe(bruto);
  // 2. 13º (mesma tributação de um salário cheio)
  const decimo = liquidoDe(bruto);
  // 3. Férias: salário + 1/3 constitucional, tributado sobre o total
  const ferias = liquidoDe(bruto * (4 / 3));
  // 4. FGTS: 8% do bruto, depositado pelo empregador (não sai do salário).
  //    Anual ≈ 13 depósitos (12 meses + 13º; o 1/3 de férias também gera FGTS — não incluído).
  const fgtsMensal = bruto * FGTS_ALIQ;
  const fgtsAnual = fgtsMensal * 13;
  // 5. Custo do empregador (estimativa mínima)
  const custoEmpregadorMensal = bruto * (1 + CUSTO_EMPREGADOR_MIN);
  // Anual líquido: 12 mensais + 13º + adicional líquido das férias (1/3 extra)
  const adicionalFerias = ferias.liquido - mensal.liquido;
  const liquidoAnual = mensal.liquido * 12 + decimo.liquido + adicionalFerias;

  const fmt = (n: number) =>
    'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Líquido', value: Math.round(mensal.liquido * 100) / 100 },
      { label: 'INSS', value: Math.round(mensal.inss * 100) / 100 },
      ...(mensal.irrf > 0 ? [{ label: 'IRRF', value: Math.round(mensal.irrf * 100) / 100 }] : []),
    ],
    prefix: 'R$ ',
    centerValue: fmt(bruto),
    centerLabel: 'Bruto',
    ariaLabel: 'Composição do salário bruto: líquido, INSS e IRRF',
  };

  const insight = {
    title: 'Seu holerite completo, de uma vez',
    text:
      `De ${fmt(bruto)} brutos você leva **${fmt(mensal.liquido)}**/mês (INSS ${fmt(mensal.inss)}` +
      (mensal.irrf > 0 ? `, IRRF ${fmt(mensal.irrf)}` : ', isento de IRRF com o redutor 2026') +
      `). No ano: **${fmt(liquidoAnual)}** líquidos (12 salários + 13º + 1/3 de férias), ` +
      `mais **${fmt(fgtsAnual)}** de FGTS na sua conta vinculada. ` +
      `Para a empresa você custa no mínimo **${fmt(custoEmpregadorMensal)}**/mês (sem RAT/terceiros).`,
    tone: 'neutral' as const,
    icon: '🧾',
  };

  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    liquidoMensal: r2(mensal.liquido),
    inss: r2(mensal.inss),
    irrf: r2(mensal.irrf),
    decimoLiquido: r2(decimo.liquido),
    feriasLiquido: r2(ferias.liquido),
    fgtsMensal: r2(fgtsMensal),
    fgtsAnual: r2(fgtsAnual),
    liquidoAnual: r2(liquidoAnual),
    custoEmpregadorMensal: r2(custoEmpregadorMensal),
    _chart: chart,
    _insight: insight,
  };
}

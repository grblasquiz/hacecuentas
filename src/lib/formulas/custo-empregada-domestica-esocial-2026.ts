// Quanto custa uma empregada doméstica com carteira assinada — eSocial / DAE 2026.
// Além do salário, o empregador recolhe ~20% de encargos patronais no DAE (Simples
// Doméstico, LC 150/2015): INSS 8% + FGTS 8% + FGTS compensatório 3,2% + GILRAT 0,8%.
// O INSS do empregado (7,5%–14%) é retido do salário e também vai no DAE, mas é
// dinheiro do trabalhador, não custo extra do patrão. O custo REAL inclui ainda as
// provisões de 13º salário e férias + 1/3, com encargos sobre elas.

import { SALARIO_MINIMO, DOMESTICA_ENCARGOS, calcINSS } from '../data/brasil-2026';

export interface Inputs {
  salarioBruto?: number;   // salário mensal (padrão: mínimo 2026)
  valeTransporte?: number;  // desconto de vale-transporte (informativo, não altera encargos)
  incluirProvisoes?: boolean; // considerar 13º e férias no custo mensal médio
}

export interface Outputs {
  encargosPatronais: string;   // 20% no DAE
  custoMensal: string;         // salário + encargos
  inssRetidoEmpregado: string; // retido do salário do empregado (informativo)
  salarioLiquido: string;      // o que o empregado recebe
  provisao13: string;
  provisaoFerias: string;
  custoRealMensal: string;     // com provisões
  custoAnual: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const brl = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function compute(i: Inputs): Outputs {
  let salario = Number(i.salarioBruto);
  if (!isFinite(salario) || salario <= 0) salario = SALARIO_MINIMO;
  if (salario < SALARIO_MINIMO) salario = SALARIO_MINIMO; // piso legal
  const vt = Math.max(0, Number(i.valeTransporte) || 0);
  const incluirProv = i.incluirProvisoes !== false;

  const E = DOMESTICA_ENCARGOS;
  const encargos = salario * E.patronalTotal;           // 20%
  const custoMensal = salario + encargos;

  const inssEmpregado = calcINSS(salario);
  const liquido = salario - inssEmpregado - Math.min(vt, salario * 0.06);

  // Provisões mensais (rateio das obrigações anuais)
  const provisao13 = (salario * (1 + E.patronalTotal)) / 12;             // 13º + encargos, /12
  const feriasRemun = salario * (1 + 1 / 3);                              // férias + 1/3 constitucional
  const provisaoFerias = (feriasRemun * (1 + E.patronalTotal)) / 12;      // + encargos, /12

  const custoRealMensal = incluirProv ? custoMensal + provisao13 + provisaoFerias : custoMensal;
  const custoAnual = custoMensal * 12 + provisao13 * 12 + provisaoFerias * 12;

  const detalhe =
    `Salário ${brl(salario)} + encargos patronais no DAE de ${(E.patronalTotal * 100).toFixed(0)}% ` +
    `(INSS 8% + FGTS 8% + FGTS compensatório 3,2% + GILRAT 0,8% = ${brl(encargos)}) = custo mensal de ${brl(custoMensal)}. ` +
    `Somando as provisões de 13º (${brl(provisao13)}/mês) e férias + 1/3 (${brl(provisaoFerias)}/mês), ` +
    `o custo real é de ${brl(custoRealMensal)}/mês, ou ${brl(custoAnual)} no ano. ` +
    `O empregado recebe líquido ${brl(liquido)} (INSS retido ${brl(inssEmpregado)}).`;

  return {
    encargosPatronais: brl(encargos),
    custoMensal: brl(custoMensal),
    inssRetidoEmpregado: brl(inssEmpregado),
    salarioLiquido: brl(liquido),
    provisao13: brl(provisao13),
    provisaoFerias: brl(provisaoFerias),
    custoRealMensal: brl(custoRealMensal),
    custoAnual: brl(custoAnual),
    detalhe,
    _insight: {
      title: `Custo real: ${brl(custoRealMensal)}/mês`,
      text:
        `Pagar ${brl(salario)} de salário custa de verdade **${brl(custoRealMensal)}/mês** (${brl(custoAnual)}/ano) ` +
        `quando você soma os **${(E.patronalTotal * 100).toFixed(0)}% de encargos** do DAE e as provisões de **13º e férias + 1/3**. ` +
        `São cerca de **${((custoRealMensal / salario - 1) * 100).toFixed(0)}% a mais** do que o salário nominal.`,
      tone: 'warn',
      icon: '🏠',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Salário', value: Number(salario.toFixed(2)) },
        { label: 'Encargos DAE (20%)', value: Number(encargos.toFixed(2)) },
        { label: 'Provisão 13º', value: Number(provisao13.toFixed(2)) },
        { label: 'Provisão férias', value: Number(provisaoFerias.toFixed(2)) },
      ],
      prefix: 'R$ ',
      centerValue: brl(custoRealMensal),
      centerLabel: 'Custo/mês',
      ariaLabel: `Salário ${brl(salario)}, encargos ${brl(encargos)}, provisão 13º ${brl(provisao13)} e férias ${brl(provisaoFerias)} somam ${brl(custoRealMensal)} por mês.`,
    },
  };
}

/**
 * IRRF — Imposto retido na fonte mensal sobre salário (2026)
 * Tabela progressiva mensal (vigente desde maio/2025) + REDUTOR 2026 da
 * reforma: IR zerado até base de R$ 5.000, redução parcial até R$ 7.350,
 * tabela cheia acima — implementação única em src/lib/data/brasil-2026.ts
 * (calcIRRF2026), a mesma do simulador de holerite.
 * Desconto simplificado mensal: R$ 607,20 (faculta não detalhar deduções).
 * Base = salário − INSS − dependentes − pensão judicial − (ou desconto simplificado se mais vantajoso).
 */
import {
  calcINSS,
  calcIRRF2026,
  calcIRRFTabelaCheia,
  IRRF_DEDUCAO_DEPENDENTE,
  IRRF_SIMPLIFICADO_MENSAL,
  IRRF_ISENCAO_REDUTOR,
} from '../data/brasil-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irrfMensalFolha(i: Inputs): Outputs {
  const salarioBruto = Number(i.salarioBruto) || 0;
  const dependentes = Number(i.dependentes) || 0;
  const pensaoJudicial = Number(i.pensaoJudicial) || 0;

  const inss = calcINSS(salarioBruto);
  const deducoesCompleta = inss + dependentes * IRRF_DEDUCAO_DEPENDENTE + pensaoJudicial;
  const baseCompleta = Math.max(0, salarioBruto - deducoesCompleta);
  const irCompleta = calcIRRF2026(baseCompleta);

  const baseSimplificada = Math.max(0, salarioBruto - IRRF_SIMPLIFICADO_MENSAL);
  const irSimplificada = calcIRRF2026(baseSimplificada);

  const irFinal = Math.min(irCompleta, irSimplificada);
  const metodoUsado = irCompleta <= irSimplificada ? 'deduções legais' : 'desconto simplificado';
  const baseUsada = irCompleta <= irSimplificada ? baseCompleta : baseSimplificada;

  // Redutor 2026 da reforma: quanto a tabela cheia cobraria vs o retido real.
  const irTabelaCheia = calcIRRFTabelaCheia(baseUsada);
  const economiaRedutor = Math.max(0, irTabelaCheia - irFinal);

  const liquido = salarioBruto - inss - irFinal;

  const totalDescontos = inss + irFinal;
  const pctDescontos = salarioBruto > 0 ? (totalDescontos / salarioBruto) * 100 : 0;
  const _insight = salarioBruto > 0
    ? {
        title: irFinal > 0 ? 'Quanto sobra no bolso' : 'Salário isento de IRRF',
        text: irFinal > 0
          ? `Do bruto de ${fmt(salarioBruto)} saem **${fmt(inss)}** de INSS e **${fmt(irFinal)}** de IRRF (pelo método de **${metodoUsado}**, o mais vantajoso), sobrando **${fmt(liquido)}** líquidos — ${pctDescontos.toFixed(1)}% do salário fica retido na fonte.` +
            (economiaRedutor > 0.005 ? ` O **redutor 2026** da reforma corta **${fmt(economiaRedutor)}** do que a tabela cheia cobraria (${fmt(irTabelaCheia)}).` : '')
          : `Com bruto de ${fmt(salarioBruto)}, você fica **isento de IRRF** — o redutor 2026 zera o imposto para base de cálculo até ${fmt(IRRF_ISENCAO_REDUTOR)}. Só **${fmt(inss)}** de INSS são descontados e o líquido é **${fmt(liquido)}**.`,
        tone: (pctDescontos >= 20 ? 'warn' : 'neutral') as 'warn' | 'neutral',
        icon: '💰',
      }
    : {
        title: 'Informe o salário',
        text: `Digite o salário bruto para ver INSS, IRRF retido e o líquido na mão.`,
        tone: 'neutral' as const,
        icon: '💰',
      };

  const out: Outputs = {
    inssDescontado: fmt(inss),
    baseIRRFCompleta: fmt(baseCompleta),
    irrfCompleta: fmt(irCompleta),
    baseIRRFSimplificada: fmt(baseSimplificada),
    irrfSimplificada: fmt(irSimplificada),
    irrfTabelaCheia: fmt(irTabelaCheia),
    economiaRedutor2026: fmt(economiaRedutor),
    irrfRetido: fmt(irFinal),
    metodoAplicado: metodoUsado,
    salarioLiquido: fmt(liquido),
    resumo: `Salário ${fmt(salarioBruto)} − INSS ${fmt(inss)} − IRRF ${fmt(irFinal)} (${metodoUsado}, já com o redutor 2026) = líquido ${fmt(liquido)}.`,
    _insight,
  };

  // Donut: salário bruto = líquido + INSS + IRRF (as partes somam o bruto)
  if (salarioBruto > 0) {
    const rLiquido = Math.round(liquido);
    const rInss = Math.round(inss);
    const rIr = Math.round(irFinal);
    const slices = [
      { label: 'Líquido', value: rLiquido },
      { label: 'INSS', value: rInss },
    ];
    if (rIr > 0) slices.push({ label: 'IRRF', value: rIr });
    out._chart = {
      type: 'doughnut' as const,
      slices,
      prefix: 'R$ ',
      centerValue: fmt(rLiquido + rInss + rIr),
      centerLabel: 'Salário bruto',
      ariaLabel: 'Composição do salário bruto: líquido, INSS e IRRF retido',
    };
  }

  return out;
}

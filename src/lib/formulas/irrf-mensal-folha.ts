/**
 * IRRF — Imposto retido na fonte mensal sobre salário
 * Tabela progressiva mensal 2026 (a partir de maio/2025):
 *  até R$ 2.428,80: isento
 *  2.428,81–2.826,65: 7,5% − 182,16
 *  2.826,66–3.751,05: 15% − 394,16
 *  3.751,06–4.664,68: 22,5% − 675,49
 *  acima 4.664,68: 27,5% − 908,73
 * Desconto simplificado mensal: R$ 607,20 (faculta não detalhar deduções).
 * Base = salário − INSS − dependentes − pensão judicial − (ou desconto simplificado se mais vantajoso).
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

const FAIXAS_MENSAIS = [
  { ate: 2428.80, aliq: 0, parcela: 0 },
  { ate: 2826.65, aliq: 0.075, parcela: 182.16 },
  { ate: 3751.05, aliq: 0.15, parcela: 394.16 },
  { ate: 4664.68, aliq: 0.225, parcela: 675.49 },
  { ate: Infinity, aliq: 0.275, parcela: 908.73 },
];

const INSS_TETO_2026 = 8157.41;
const DESCONTO_SIMPL_MENSAL = 607.20;
const DEP_MENSAL = 189.59;

function inssMensal(s: number): number {
  if (s <= 1518.00) return s * 0.075;
  if (s <= 2793.88) return s * 0.09 - 22.77;
  if (s <= 4190.83) return s * 0.12 - 106.59;
  if (s <= 8157.41) return s * 0.14 - 190.40;
  return INSS_TETO_2026 * 0.14 - 190.40;
}

function irrf(base: number): number {
  if (base <= 0) return 0;
  for (const f of FAIXAS_MENSAIS) if (base <= f.ate) return Math.max(0, base * f.aliq - f.parcela);
  return 0;
}

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irrfMensalFolha(i: Inputs): Outputs {
  const salarioBruto = Number(i.salarioBruto) || 0;
  const dependentes = Number(i.dependentes) || 0;
  const pensaoJudicial = Number(i.pensaoJudicial) || 0;

  const inss = inssMensal(salarioBruto);
  const deducoesCompleta = inss + dependentes * DEP_MENSAL + pensaoJudicial;
  const baseCompleta = Math.max(0, salarioBruto - deducoesCompleta);
  const irCompleta = irrf(baseCompleta);

  const baseSimplificada = Math.max(0, salarioBruto - DESCONTO_SIMPL_MENSAL);
  const irSimplificada = irrf(baseSimplificada);

  const irFinal = Math.min(irCompleta, irSimplificada);
  const metodoUsado = irCompleta <= irSimplificada ? 'deduções legais' : 'desconto simplificado';

  const liquido = salarioBruto - inss - irFinal;

  const totalDescontos = inss + irFinal;
  const pctDescontos = salarioBruto > 0 ? (totalDescontos / salarioBruto) * 100 : 0;
  const _insight = salarioBruto > 0
    ? {
        title: irFinal > 0 ? 'Quanto sobra no bolso' : 'Salário isento de IRRF',
        text: irFinal > 0
          ? `Do bruto de ${fmt(salarioBruto)} saem **${fmt(inss)}** de INSS e **${fmt(irFinal)}** de IRRF (pelo método de **${metodoUsado}**, o mais vantajoso), sobrando **${fmt(liquido)}** líquidos — ${pctDescontos.toFixed(1)}% do salário fica retido na fonte.`
          : `Com bruto de ${fmt(salarioBruto)}, você fica **isento de IRRF**: só **${fmt(inss)}** de INSS são descontados e o líquido é **${fmt(liquido)}**.`,
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
    irrfRetido: fmt(irFinal),
    metodoAplicado: metodoUsado,
    salarioLiquido: fmt(liquido),
    resumo: `Salário ${fmt(salarioBruto)} − INSS ${fmt(inss)} − IRRF ${fmt(irFinal)} (${metodoUsado}) = líquido ${fmt(liquido)}.`,
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

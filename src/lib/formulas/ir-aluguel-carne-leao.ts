/**
 * IR sobre aluguéis recebidos de pessoa física — Carnê-Leão mensal
 * Obrigatório quando o locatário é PF (se for PJ, há retenção na fonte).
 * Base = aluguel bruto − despesas dedutíveis (IPTU, condomínio, taxa adm imobiliária)
 *       − dependentes (R$ 189,59/mês) − pensão judicial.
 * Aplicar tabela progressiva mensal IRPF. Código DARF: 0190.
 * Vencimento: último dia útil do mês seguinte. Lei 7.713/1988, art. 8º.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }

const FAIXAS = [
  { ate: 2428.80, aliq: 0, parcela: 0 },
  { ate: 2826.65, aliq: 0.075, parcela: 182.16 },
  { ate: 3751.05, aliq: 0.15, parcela: 394.16 },
  { ate: 4664.68, aliq: 0.225, parcela: 675.49 },
  { ate: Infinity, aliq: 0.275, parcela: 908.73 },
];

const DEP_MENSAL = 189.59;

function carneLeao(base: number): number {
  if (base <= 0) return 0;
  for (const f of FAIXAS) if (base <= f.ate) return Math.max(0, base * f.aliq - f.parcela);
  return 0;
}

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irAluguelCarneLeao(i: Inputs): Outputs {
  const aluguelBruto = Number(i.aluguelBruto) || 0;
  const iptu = Number(i.iptu) || 0;
  const condominio = Number(i.condominio) || 0;
  const taxaAdm = Number(i.taxaAdmImobiliaria) || 0;
  const dependentes = Number(i.dependentes) || 0;
  const pensao = Number(i.pensaoJudicial) || 0;

  const despesasDedutiveis = iptu + condominio + taxaAdm;
  const base = Math.max(0, aluguelBruto - despesasDedutiveis - dependentes * DEP_MENSAL - pensao);
  const imposto = carneLeao(base);
  const liquido = aluguelBruto - despesasDedutiveis - imposto;
  const aliqEfetiva = aluguelBruto > 0 ? (imposto / aluguelBruto) * 100 : 0;

  const _insight = imposto > 0
    ? {
        title: 'Carnê-Leão a recolher este mês',
        text: `Sobre a base de **${fmt(base)}** o Carnê-Leão devido é **${fmt(imposto)}** (DARF 0190), o que representa uma alíquota efetiva de **${aliqEfetiva.toFixed(2)}%** do aluguel bruto. No bolso ficam **${fmt(liquido)}**.`,
        tone: 'warn',
        icon: '🏠',
      }
    : {
        title: 'Sem imposto neste mês',
        text: base <= 0
          ? `Após deduzir despesas e abatimentos, a base ficou em **${fmt(base)}**: não há Carnê-Leão a pagar. Você embolsa **${fmt(liquido)}** do aluguel.`
          : `A base de **${fmt(base)}** está dentro da faixa isenta da tabela mensal (até R$ 2.428,80): **R$ 0,00** de Carnê-Leão. Líquido de **${fmt(liquido)}**.`,
        tone: 'good',
        icon: '🏠',
      };

  const _chart = (aluguelBruto > 0 && liquido >= 0)
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Líquido no bolso', value: Math.round(liquido * 100) / 100 },
          { label: 'Despesas dedutíveis', value: Math.round(despesasDedutiveis * 100) / 100 },
          { label: 'Carnê-Leão (IR)', value: Math.round(imposto * 100) / 100 },
        ],
        prefix: 'R$ ',
        centerValue: fmt(aluguelBruto),
        centerLabel: 'Aluguel bruto',
        ariaLabel: `Composição do aluguel bruto de ${fmt(aluguelBruto)}: ${fmt(liquido)} líquido, ${fmt(despesasDedutiveis)} de despesas e ${fmt(imposto)} de imposto.`,
      }
    : undefined;

  return {
    despesasDedutiveis: fmt(despesasDedutiveis),
    baseCalculo: fmt(base),
    carneLeaoDevido: fmt(imposto),
    aluguelLiquido: fmt(liquido),
    aliquotaEfetiva: aliqEfetiva.toFixed(2) + '%',
    codigoDarf: '0190',
    vencimento: 'Último dia útil do mês seguinte',
    resumo: `Aluguel bruto ${fmt(aluguelBruto)} − despesas ${fmt(despesasDedutiveis)} − deduções familiares = base ${fmt(base)}. Carnê-Leão: ${fmt(imposto)} (DARF 0190). Líquido: ${fmt(liquido)}.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}

/**
 * IR sobre aluguéis recebidos de pessoa física — Carnê-Leão mensal
 * Obrigatório quando o locatário é PF (se for PJ, há retenção na fonte).
 * Base = aluguel bruto − despesas dedutíveis (IPTU, condomínio, taxa adm imobiliária)
 *       − dependentes (R$ 189,59/mês) − pensão judicial.
 * Aplicar tabela progressiva mensal IRPF. Código DARF: 0190.
 * Vencimento: último dia útil do mês seguinte. Lei 7.713/1988, art. 8º.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

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

  return {
    despesasDedutiveis: fmt(despesasDedutiveis),
    baseCalculo: fmt(base),
    carneLeaoDevido: fmt(imposto),
    aluguelLiquido: fmt(liquido),
    aliquotaEfetiva: aliqEfetiva.toFixed(2) + '%',
    codigoDarf: '0190',
    vencimento: 'Último dia útil do mês seguinte',
    resumo: `Aluguel bruto ${fmt(aluguelBruto)} − despesas ${fmt(despesasDedutiveis)} − deduções familiares = base ${fmt(base)}. Carnê-Leão: ${fmt(imposto)} (DARF 0190). Líquido: ${fmt(liquido)}.`,
  };
}

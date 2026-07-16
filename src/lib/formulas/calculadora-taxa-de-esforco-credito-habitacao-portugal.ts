/**
 * Taxa de esforço — Portugal. Peso dos encargos com créditos no rendimento líquido.
 * Taxa de esforço = (encargos mensais com créditos ÷ rendimento líquido mensal) × 100.
 * Referências do Banco de Portugal: até ~35 % é confortável; o limite recomendado
 * situa-se em torno dos 45 %. Cálculo de utilidade (rácio), sem dependência de tabelas
 * fiscais. fmtEUR vem de portugal-2026.ts.
 */
import { fmtEUR } from '../data/portugal-2026.ts';

export interface Inputs {
  rendimentoLiquido: number;    // rendimento líquido mensal do agregado (€)
  prestacaoNova: number;        // prestação mensal do novo crédito habitação (€)
  outrosCreditos?: number;      // outras prestações mensais (auto, pessoal, cartões) (€)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; _chart?: any; }

const LIMITE_CONFORTAVEL = 35; // %
const LIMITE_MAXIMO = 45;      // % (referência recomendada)

export function compute(i: Inputs): Outputs {
  const rendimento = Math.max(0, Number(i.rendimentoLiquido) || 0);
  const prestacao = Math.max(0, Number(i.prestacaoNova) || 0);
  const outros = Math.max(0, Number(i.outrosCreditos) || 0);
  if (rendimento <= 0) throw new Error('Indique o rendimento líquido mensal do agregado');

  const encargos = prestacao + outros;
  const taxa = (encargos / rendimento) * 100;
  const taxaStr = taxa.toLocaleString('de-DE', { maximumFractionDigits: 1 });

  const margem35 = rendimento * (LIMITE_CONFORTAVEL / 100) - encargos; // quanto ainda cabe até 35 %
  const margem45 = rendimento * (LIMITE_MAXIMO / 100) - encargos;      // quanto ainda cabe até 45 %

  let classificacao: string;
  let tone: string;
  if (taxa <= LIMITE_CONFORTAVEL) { classificacao = 'Confortável'; tone = 'good'; }
  else if (taxa <= LIMITE_MAXIMO) { classificacao = 'No limite aceitável'; tone = 'warn'; }
  else { classificacao = 'Elevada (risco)'; tone = 'warn'; }

  const _table = {
    title: 'Cálculo da taxa de esforço',
    headers: ['Conceito', 'Valor'],
    rows: [
      ['Rendimento líquido mensal', fmtEUR(rendimento)],
      ['Prestação do novo crédito', fmtEUR(prestacao)],
      ['Outros créditos', fmtEUR(outros)],
      ['Encargos totais', fmtEUR(encargos)],
      ['Taxa de esforço', `${taxaStr} %`],
      ['Margem até 35 % (confortável)', margem35 >= 0 ? fmtEUR(margem35) : `excede em ${fmtEUR(-margem35)}`],
    ],
    note: 'Referências do Banco de Portugal: ~35 % confortável, ~45 % limite recomendado. A decisão de crédito de cada banco pondera ainda o DSTI e o histórico.',
  };

  const _insight = {
    title: `Taxa de esforço: ${taxaStr} % — ${classificacao}`,
    text: `Com **${fmtEUR(rendimento)}** líquidos/mês e **${fmtEUR(encargos)}** de encargos, a sua taxa de esforço é **${taxaStr} %**. ` +
      (taxa <= LIMITE_CONFORTAVEL
        ? `Está na zona **confortável** (≤ 35 %). Ainda tem margem de **${fmtEUR(Math.max(0, margem35))}** antes de chegar aos 35 %.`
        : taxa <= LIMITE_MAXIMO
          ? `Está **acima dos 35 %** mas dentro do limite recomendado (~45 %). Reduzir a prestação ou o prazo ajuda a folgar o orçamento.`
          : `Está **acima do limite recomendado (~45 %)**: a maioria dos bancos dificilmente aprova o crédito nestas condições. Reduza o montante, alargue o prazo ou traga um segundo titular.`),
    tone,
    icon: '🏦',
  };

  const _chart = {
    type: 'bar' as const,
    bars: [
      { label: 'A sua taxa', value: Math.round(taxa) },
      { label: 'Confortável (35 %)', value: LIMITE_CONFORTAVEL },
      { label: 'Limite (45 %)', value: LIMITE_MAXIMO },
    ],
    suffix: ' %',
    ariaLabel: `A sua taxa de esforço ${taxaStr} %, face a 35 % (confortável) e 45 % (limite).`,
  };

  return {
    taxaEsforco: `${taxaStr} %`,
    classificacao,
    encargos: fmtEUR(encargos),
    margem35: margem35 >= 0 ? fmtEUR(margem35) : `Excede em ${fmtEUR(-margem35)}`,
    margem45: margem45 >= 0 ? fmtEUR(margem45) : `Excede em ${fmtEUR(-margem45)}`,
    detalhe: `${fmtEUR(encargos)} ÷ ${fmtEUR(rendimento)} = ${taxaStr} % (${classificacao}).`,
    _insight,
    _table,
    _chart,
  };
}

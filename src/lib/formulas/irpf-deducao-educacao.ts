/**
 * IRPF — Dedução de despesas com instrução
 * Limite individual anual: R$ 3.561,50 por pessoa (titular + dependentes)
 * Lei 9.250/1995, art. 8º II b; IN RFB anual
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const LIMITE_POR_PESSOA = 3561.50;

const fmt = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function irpfDeducaoEducacao(i: Inputs): Outputs {
  const gastoTitular = Number(i.gastoTitular) || 0;
  const gastoDependentes = Number(i.gastoDependentes) || 0;
  const qtdeDependentes = Number(i.qtdeDependentes) || 0;
  const aliq = (Number(i.aliquotaMarginal) || 27.5) / 100;

  const dedTitular = Math.min(gastoTitular, LIMITE_POR_PESSOA);
  const limiteDep = qtdeDependentes * LIMITE_POR_PESSOA;
  const dedDep = Math.min(gastoDependentes, limiteDep);
  const dedTotal = dedTitular + dedDep;

  const gastoTotal = gastoTitular + gastoDependentes;
  const excedido = gastoTotal - dedTotal;
  const economiaIR = dedTotal * aliq;

  return {
    deducaoTitular: fmt(dedTitular),
    limiteDependentes: fmt(limiteDep),
    deducaoDependentes: fmt(dedDep),
    deducaoTotal: fmt(dedTotal),
    valorNaoDedutivel: fmt(excedido),
    economiaIR: fmt(economiaIR),
    resumo: `Gasto educação ${fmt(gastoTotal)}. Dedutível ${fmt(dedTotal)} (limite ${fmt(LIMITE_POR_PESSOA)}/pessoa). Economia em IR na alíquota de ${(aliq * 100).toFixed(1)}%: ${fmt(economiaIR)}.`,
  };
}

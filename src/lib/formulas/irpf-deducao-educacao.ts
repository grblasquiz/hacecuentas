/**
 * IRPF — Dedução de despesas com instrução
 * Limite individual anual: R$ 3.561,50 por pessoa (titular + dependentes)
 * Lei 9.250/1995, art. 8º II b; IN RFB anual
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; _insight?: any; _chart?: any; }

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

  let _insight: any;
  if (gastoTotal <= 0) {
    _insight = {
      title: 'Informe os gastos',
      text: `Educação é dedutível até **${fmt(LIMITE_POR_PESSOA)}/pessoa** ao ano. Informe seus gastos para ver quanto entra na declaração.`,
      tone: 'neutral',
      icon: '🎓',
    };
  } else if (excedido > 0.005) {
    _insight = {
      title: 'Parte do gasto estoura o limite',
      text: `Dos ${fmt(gastoTotal)} gastos, só **${fmt(dedTotal)}** são dedutíveis: **${fmt(excedido)}** ficam de fora por exceder o teto de ${fmt(LIMITE_POR_PESSOA)}/pessoa. A economia no IR é de **${fmt(economiaIR)}**.`,
      tone: 'warn',
      icon: '🎓',
    };
  } else {
    _insight = {
      title: 'Gasto totalmente dedutível',
      text: `Seus ${fmt(gastoTotal)} de educação entram **integralmente** na declaração (dentro do teto de ${fmt(LIMITE_POR_PESSOA)}/pessoa) e reduzem **${fmt(economiaIR)}** no IR a pagar.`,
      tone: 'good',
      icon: '🎓',
    };
  }

  // Donut: gasto total = parte dedutível + parte que excede o limite. Somam o gasto total.
  const _chart = gastoTotal > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Dedutível', value: Math.round(dedTotal * 100) / 100 },
          { label: 'Acima do limite', value: Math.round(excedido * 100) / 100 },
        ].filter((s) => s.value > 0),
        prefix: '',
        centerValue: fmt(gastoTotal),
        centerLabel: 'Gasto total',
        ariaLabel: `Reparto do gasto com educação de ${fmt(gastoTotal)}: dedutível ${fmt(dedTotal)} e acima do limite ${fmt(excedido)}.`,
      }
    : undefined;

  return {
    deducaoTitular: fmt(dedTitular),
    limiteDependentes: fmt(limiteDep),
    deducaoDependentes: fmt(dedDep),
    deducaoTotal: fmt(dedTotal),
    valorNaoDedutivel: fmt(excedido),
    economiaIR: fmt(economiaIR),
    resumo: `Gasto educação ${fmt(gastoTotal)}. Dedutível ${fmt(dedTotal)} (limite ${fmt(LIMITE_POR_PESSOA)}/pessoa). Economia em IR na alíquota de ${(aliq * 100).toFixed(1)}%: ${fmt(economiaIR)}.`,
    _insight,
    _chart,
  };
}

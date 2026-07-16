// Custo de obra por m² — quanto custa construir uma casa (base CUB).
// O CUB (Custo Unitário Básico, NBR 12.721) é divulgado mensalmente por cada
// Sinduscon estadual e é a referência oficial de custo por m² de construção.
// Como o CUB cobre basicamente estrutura, alvenaria e acabamentos padrão (não
// inclui fundações especiais, projetos, ligações, terreno nem BDI), o custo
// real de uma obra costuma ficar acima do CUB. A calculadora aplica uma faixa
// realista sobre o CUB informado, conforme o padrão de acabamento.
// O valor do CUB por m² é editável (consulte o Sinduscon do seu estado).

export interface Inputs {
  areaConstruida: number;   // m²
  cubM2: number;            // R$/m² (CUB do estado)
  padrao?: string;          // 'baixo' | 'normal' | 'alto'
}
export interface Outputs {
  custoCUB: string;
  custoEstimado: string;
  custoMin: string;
  custoMax: string;
  custoPorM2Final: string;
  detalhe: string;
  _insight?: any;
  _chart?: any;
}

const fmtBRL = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtBRL0 = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

// Multiplicador sobre o CUB para chegar ao custo total (faixa central) e a
// amplitude (mín–máx) por padrão de acabamento.
const PADROES: Record<string, { centro: number; min: number; max: number; nome: string }> = {
  baixo: { centro: 1.15, min: 1.05, max: 1.25, nome: 'padrão simples/econômico' },
  normal: { centro: 1.30, min: 1.15, max: 1.45, nome: 'padrão normal' },
  alto: { centro: 1.55, min: 1.40, max: 1.75, nome: 'padrão alto/luxo' },
};

export function compute(i: Inputs): Outputs {
  const area = Number(i.areaConstruida) || 0;
  const cub = Number(i.cubM2) || 0;
  const cfg = PADROES[String(i.padrao)] || PADROES.normal;

  if (area <= 0 || cub <= 0) {
    return {
      custoCUB: '—', custoEstimado: '—', custoMin: '—', custoMax: '—', custoPorM2Final: '—',
      detalhe: 'Informe a área construída (m²) e o CUB por m² do seu estado.',
      _insight: { title: 'Faltam dados', text: 'Informe a **área construída** e o **CUB por m²** (consulte o Sinduscon do seu estado).', tone: 'warn', icon: '⚠️' },
    };
  }

  const custoCUB = area * cub;                 // custo "puro" pelo CUB
  const custoEstimado = custoCUB * cfg.centro; // custo total estimado (faixa central)
  const custoMin = custoCUB * cfg.min;
  const custoMax = custoCUB * cfg.max;
  const custoPorM2Final = custoEstimado / area;

  const detalhe = `Área ${area.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m² × CUB ${fmtBRL(cub)}/m² = ${fmtBRL(custoCUB)} (custo CUB). Aplicando o ${cfg.nome}, o custo total estimado fica em torno de ${fmtBRL0(custoEstimado)} (faixa ${fmtBRL0(custoMin)} a ${fmtBRL0(custoMax)}), ou cerca de ${fmtBRL(custoPorM2Final)} por m².`;

  return {
    custoCUB: fmtBRL(custoCUB),
    custoEstimado: fmtBRL(custoEstimado),
    custoMin: fmtBRL(custoMin),
    custoMax: fmtBRL(custoMax),
    custoPorM2Final: `${fmtBRL(custoPorM2Final)}/m²`,
    detalhe,
    _insight: {
      title: `Obra estimada: ${fmtBRL0(custoEstimado)}`,
      text: `Uma casa de **${area.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} m²** no ${cfg.nome} deve custar entre **${fmtBRL0(custoMin)}** e **${fmtBRL0(custoMax)}** — em média **${fmtBRL0(custoEstimado)}**, ou ${fmtBRL(custoPorM2Final)} por m². O CUB puro seria ${fmtBRL0(custoCUB)}; o restante são fundações, projetos, ligações e BDI.`,
      tone: 'neutral',
      icon: '🏗️',
    },
    _chart: {
      type: 'bar',
      labels: ['Custo CUB', 'Estimado (mín)', 'Estimado (médio)', 'Estimado (máx)'],
      values: [Math.round(custoCUB), Math.round(custoMin), Math.round(custoEstimado), Math.round(custoMax)],
      prefix: 'R$ ',
      ariaLabel: `Custo CUB ${fmtBRL0(custoCUB)}, estimado de ${fmtBRL0(custoMin)} a ${fmtBRL0(custoMax)}.`,
    },
  };
}

/**
 * Auxílio Brasil / Bolsa Família 2026
 * O programa Auxílio Brasil foi renomeado para Bolsa Família em 2023. Aqui mantemos
 * a calculadora para quem ainda busca pelo nome antigo — mesma regra:
 *   R$ 600 base + R$ 150 criança 0-6 + R$ 50 jovens 7-17/gestantes
 *   Renda per capita < R$ 218.
 */

export interface AuxilioBrasilInputs {
  rendaFamiliarTotal: number;
  numeroMembros: number;
  criancas0a6: number;
  jovens7a17: number;
  gestantesNutrizes: number;
}

export interface AuxilioBrasilOutputs {
  rendaPerCapita: number;
  elegivel: string;
  valorTotal: number;
  nomeProgramaAtual: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

const LIMITE_PER_CAPITA = 218;
const VALOR_BASE = 600;
const ADICIONAL_CRIANCA = 150;
const ADICIONAL_JOVEM = 50;

export function auxilioBrasil(inputs: AuxilioBrasilInputs): AuxilioBrasilOutputs {
  const renda = Number(inputs.rendaFamiliarTotal) || 0;
  const membros = Math.max(1, Number(inputs.numeroMembros) || 1);
  const criancas = Number(inputs.criancas0a6) || 0;
  const jovens = Number(inputs.jovens7a17) || 0;
  const gestantes = Number(inputs.gestantesNutrizes) || 0;

  const perCapita = renda / membros;
  const elegivelBool = perCapita < LIMITE_PER_CAPITA;
  const elegivel = elegivelBool
    ? `Elegível (renda per capita R$ ${perCapita.toFixed(2)} < R$ ${LIMITE_PER_CAPITA})`
    : `Não elegível (renda per capita R$ ${perCapita.toFixed(2)} ≥ R$ ${LIMITE_PER_CAPITA})`;

  const adicCriancas = criancas * ADICIONAL_CRIANCA;
  const adicJovens = (jovens + gestantes) * ADICIONAL_JOVEM;
  const valorTotal = elegivelBool ? VALOR_BASE + adicCriancas + adicJovens : 0;

  const formula = `Valor = R$ ${VALOR_BASE} + ${criancas}×R$ ${ADICIONAL_CRIANCA} + ${jovens + gestantes}×R$ ${ADICIONAL_JOVEM} = R$ ${valorTotal}`;
  const explicacion = `Nota: o programa "Auxílio Brasil" foi renomeado para "Bolsa Família" em 2023 — ambos seguem a mesma regra. Sua família tem renda per capita de R$ ${perCapita.toFixed(2)}. ${elegivel}. Valor estimado: R$ ${valorTotal}. CadÚnico obrigatório.`;

  const fmtR = (n: number) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const _insight = elegivelBool
    ? {
        title: 'Sua família tem direito',
        text: `Com renda per capita de **${fmtR(Math.round(perCapita * 100) / 100)}** (abaixo do limite de R$ ${LIMITE_PER_CAPITA}), sua família é **elegível** e o benefício estimado é de **${fmtR(valorTotal)} por mês**. É obrigatório estar inscrito no CadÚnico e manter os dados atualizados.`,
        tone: 'good',
        icon: '🤝',
      }
    : {
        title: 'Fora do limite de renda',
        text: `A renda per capita de **${fmtR(Math.round(perCapita * 100) / 100)}** ficou **acima** do limite de R$ ${LIMITE_PER_CAPITA}, então a família **não é elegível** ao benefício pela regra atual. Se a renda mudar, vale recalcular e atualizar o CadÚnico.`,
        tone: 'warn',
        icon: '⚠️',
      };

  const out: AuxilioBrasilOutputs = {
    rendaPerCapita: Math.round(perCapita * 100) / 100,
    elegivel,
    valorTotal,
    nomeProgramaAtual: 'Bolsa Família (ex-Auxílio Brasil)',
    formula,
    explicacion,
    _insight,
  };

  // Donut: composição do benefício (base + adicionais que somam o total) — só quando há adicionais
  if (elegivelBool && (adicCriancas + adicJovens) > 0) {
    const slices = [{ label: 'Benefício base', value: VALOR_BASE }];
    if (adicCriancas > 0) slices.push({ label: `Crianças 0-6 (${criancas})`, value: adicCriancas });
    if (adicJovens > 0) slices.push({ label: `Jovens/gestantes (${jovens + gestantes})`, value: adicJovens });
    out._chart = {
      type: 'doughnut',
      slices,
      prefix: 'R$ ',
      centerValue: fmtR(valorTotal),
      centerLabel: 'por mês',
      ariaLabel: `Composição do benefício mensal de ${fmtR(valorTotal)}: base de R$ ${VALOR_BASE} mais adicionais`,
    };
  }

  return out;
}

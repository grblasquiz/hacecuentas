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

  return {
    rendaPerCapita: Math.round(perCapita * 100) / 100,
    elegivel,
    valorTotal,
    nomeProgramaAtual: 'Bolsa Família (ex-Auxílio Brasil)',
    formula,
    explicacion,
  };
}

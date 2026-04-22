/**
 * Bolsa Família 2026
 * Base: R$ 600 por família
 * Adicional: R$ 150 por criança 0-6 anos
 * Adicional: R$ 50 por jovem 7-17 anos, gestante ou nutriz
 * Regra: renda per capita < R$ 218 mensais + CadÚnico ativo
 */

export interface BolsaFamiliaInputs {
  rendaFamiliarTotal: number;
  numeroMembros: number;
  criancas0a6: number;
  jovens7a17: number;
  gestantesNutrizes: number;
}

export interface BolsaFamiliaOutputs {
  rendaPerCapita: number;
  elegivel: string;
  valorBase: number;
  adicionalCriancas: number;
  adicionalJovens: number;
  valorTotal: number;
  formula: string;
  explicacion: string;
}

const LIMITE_PER_CAPITA = 218;
const VALOR_BASE = 600;
const ADICIONAL_CRIANCA = 150;
const ADICIONAL_JOVEM = 50;

export function bolsaFamiliaValor(inputs: BolsaFamiliaInputs): BolsaFamiliaOutputs {
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

  const formula = `Valor = R$ ${VALOR_BASE} base + ${criancas}×R$ ${ADICIONAL_CRIANCA} (crianças) + ${jovens + gestantes}×R$ ${ADICIONAL_JOVEM} (jovens/gestantes) = R$ ${valorTotal}`;
  const explicacion = `Sua família tem renda per capita de R$ ${perCapita.toFixed(2)}. ${elegivel}. O valor total do Bolsa Família seria R$ ${valorTotal} (base R$ ${VALOR_BASE} + R$ ${adicCriancas} por crianças 0-6 anos + R$ ${adicJovens} por jovens 7-17/gestantes). Lembre que é obrigatório estar cadastrado no CadÚnico.`;

  return {
    rendaPerCapita: Math.round(perCapita * 100) / 100,
    elegivel,
    valorBase: elegivelBool ? VALOR_BASE : 0,
    adicionalCriancas: elegivelBool ? adicCriancas : 0,
    adicionalJovens: elegivelBool ? adicJovens : 0,
    valorTotal,
    formula,
    explicacion,
  };
}

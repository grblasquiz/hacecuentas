/**
 * Seguro-desemprego 2026 — Valor das parcelas.
 * Base: média dos 3 últimos salários.
 *   Até R$ 2.041,40 → 80% da média
 *   Entre R$ 2.041,40 e R$ 3.402,65 → R$ 1.633,12 + 50% do excedente a R$ 2.041,40
 *   Acima R$ 3.402,65 → teto R$ 2.313,74
 * Valor mínimo: 1 salário mínimo (R$ 1.518).
 */

export interface SeguroDesempregoValorInputs {
  salario1: number;
  salario2: number;
  salario3: number;
}

export interface SeguroDesempregoValorOutputs {
  mediaSalarios: number;
  faixaAplicada: string;
  valorParcela: number;
  formula: string;
  explicacion: string;
}

const FAIXA1 = 2041.40;
const FAIXA2 = 3402.65;
const PARCELA_FAIXA1_FIXA = 1633.12;
const TETO = 2313.74;
const SALARIO_MINIMO = 1518;

export function seguroDesempregoValor(inputs: SeguroDesempregoValorInputs): SeguroDesempregoValorOutputs {
  const s1 = Number(inputs.salario1) || 0;
  const s2 = Number(inputs.salario2) || 0;
  const s3 = Number(inputs.salario3) || 0;

  if (s1 <= 0 || s2 <= 0 || s3 <= 0) {
    throw new Error('Ingresá os 3 últimos salários');
  }

  const media = (s1 + s2 + s3) / 3;
  let valor = 0;
  let faixa = '';

  if (media <= FAIXA1) {
    valor = media * 0.8;
    faixa = `80% da média (até R$ ${FAIXA1.toFixed(2)})`;
  } else if (media <= FAIXA2) {
    valor = PARCELA_FAIXA1_FIXA + (media - FAIXA1) * 0.5;
    faixa = `R$ ${PARCELA_FAIXA1_FIXA.toFixed(2)} + 50% do excedente a R$ ${FAIXA1.toFixed(2)}`;
  } else {
    valor = TETO;
    faixa = `Teto R$ ${TETO.toFixed(2)}`;
  }

  // Valor mínimo = 1 salário mínimo
  if (valor < SALARIO_MINIMO) {
    valor = SALARIO_MINIMO;
    faixa += ` (ajustado ao piso: 1 salário mínimo R$ ${SALARIO_MINIMO})`;
  }

  const formula = `Média 3 salários = (${s1.toFixed(2)} + ${s2.toFixed(2)} + ${s3.toFixed(2)}) / 3 = R$ ${media.toFixed(2)} → Parcela R$ ${valor.toFixed(2)}`;
  const explicacion = `A média dos 3 últimos salários é R$ ${media.toFixed(2)}. Aplicando a tabela 2026 do seguro-desemprego (${faixa}), o valor de cada parcela é R$ ${valor.toFixed(2)}. O benefício tem valor mínimo de 1 salário mínimo (R$ ${SALARIO_MINIMO}) e teto de R$ ${TETO.toFixed(2)}.`;

  return {
    mediaSalarios: Math.round(media * 100) / 100,
    faixaAplicada: faixa,
    valorParcela: Math.round(valor * 100) / 100,
    formula,
    explicacion,
  };
}

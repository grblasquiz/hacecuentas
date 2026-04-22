/**
 * Bolo de Casamento — kg por convidado (Brasil)
 * 100g de bolo por convidado.
 * Doces finos: 8-10 unidades por pessoa.
 */

export interface BoloCasamentoBrInputs {
  numeroConvidados: number;
  doceFinoPorPessoa: number;
}

export interface BoloCasamentoBrOutputs {
  boloKg: number;
  docesTotal: number;
  formula: string;
  explicacion: string;
}

const GRAMAS_POR_PESSOA = 100;

export function boloCasamentoBr(inputs: BoloCasamentoBrInputs): BoloCasamentoBrOutputs {
  const convidados = Number(inputs.numeroConvidados) || 0;
  const docePorPessoa = Number(inputs.doceFinoPorPessoa) || 9;

  if (convidados <= 0) {
    throw new Error('Ingresá o número de convidados');
  }

  const boloKg = (convidados * GRAMAS_POR_PESSOA) / 1000;
  const doces = convidados * docePorPessoa;

  const formula = `Bolo = ${convidados} × 100g = ${boloKg.toFixed(2)}kg · Doces = ${convidados} × ${docePorPessoa} = ${doces} unidades`;
  const explicacion = `Para ${convidados} convidados, o ideal é encomendar um bolo de aproximadamente ${boloKg.toFixed(2)}kg (100g por pessoa) e cerca de ${doces} doces finos (${docePorPessoa} por pessoa). Essas são as proporções padrão das confeitarias brasileiras — ajuste conforme o perfil dos convidados.`;

  return {
    boloKg: Math.round(boloKg * 100) / 100,
    docesTotal: doces,
    formula,
    explicacion,
  };
}

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
  _insight?: any;
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

  const _insight = {
    title: 'Sua encomenda',
    text: `Para **${convidados} convidados** você precisa de um bolo de **${boloKg.toFixed(2)}kg** e cerca de **${doces} doces finos**. Encomende na confeitaria com 10 a 15 dias de antecedência e confirme se o bolo terá andares suficientes para esse peso.`,
    tone: 'neutral',
    icon: '🎂',
  };

  return {
    boloKg: Math.round(boloKg * 100) / 100,
    docesTotal: doces,
    formula,
    explicacion,
    _insight,
  };
}

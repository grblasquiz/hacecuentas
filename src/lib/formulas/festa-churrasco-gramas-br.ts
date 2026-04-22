/**
 * Festa Churrasco — Gramas por pessoa (Brasil)
 * Proporções tradicionais:
 *   Picanha: 400g por adulto (200g por criança)
 *   Linguiça: 150g por adulto (75g por criança)
 *   Frango: 200g por adulto (100g por criança)
 *   Pão de alho: 2 unidades por adulto (1 por criança)
 */

export interface ChurrascoBrInputs {
  adultos: number;
  criancas: number;
}

export interface ChurrascoBrOutputs {
  picanhaKg: number;
  linguicaKg: number;
  frangoKg: number;
  paoUnidades: number;
  carneTotalKg: number;
  formula: string;
  explicacion: string;
}

export function festaChurrascoGramasBr(inputs: ChurrascoBrInputs): ChurrascoBrOutputs {
  const adultos = Number(inputs.adultos) || 0;
  const criancas = Number(inputs.criancas) || 0;

  if (adultos + criancas <= 0) {
    throw new Error('Ingresá quantidade de adultos e/ou crianças');
  }

  const picanha = (adultos * 400 + criancas * 200) / 1000;
  const linguica = (adultos * 150 + criancas * 75) / 1000;
  const frango = (adultos * 200 + criancas * 100) / 1000;
  const pao = adultos * 2 + criancas * 1;

  const carneTotal = picanha + linguica + frango;

  const formula = `Picanha ${picanha.toFixed(2)}kg + Linguiça ${linguica.toFixed(2)}kg + Frango ${frango.toFixed(2)}kg = ${carneTotal.toFixed(2)}kg de carne para ${adultos} adultos e ${criancas} crianças`;
  const explicacion = `Para ${adultos} adultos e ${criancas} crianças você precisa de aproximadamente ${picanha.toFixed(2)}kg de picanha, ${linguica.toFixed(2)}kg de linguiça, ${frango.toFixed(2)}kg de frango e ${pao} pães de alho. Total de carne: ~${carneTotal.toFixed(2)}kg. Dica: compre 10-15% a mais para garantir.`;

  return {
    picanhaKg: Math.round(picanha * 100) / 100,
    linguicaKg: Math.round(linguica * 100) / 100,
    frangoKg: Math.round(frango * 100) / 100,
    paoUnidades: pao,
    carneTotalKg: Math.round(carneTotal * 100) / 100,
    formula,
    explicacion,
  };
}

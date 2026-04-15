/** Superficie corporal (BSA) — Du Bois, Mosteller, Haycock */
export interface Inputs {
  peso: number;
  altura: number;
}
export interface Outputs {
  mosteller: number;
  duBois: number;
  haycock: number;
  promedio: number;
  resumen: string;
  ejemplos: string;
}

export function superficieCorporal(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  if (!peso || peso < 1 || peso > 400) throw new Error('Peso entre 1 y 400 kg');
  if (!altura || altura < 30 || altura > 250) throw new Error('Altura entre 30 y 250 cm');

  // Mosteller (1987) — la más usada hoy en oncología pediátrica:
  //   BSA (m²) = √(peso × altura / 3600)
  const mosteller = Math.sqrt((peso * altura) / 3600);

  // Du Bois & Du Bois (1916):
  //   BSA = 0.007184 × peso^0.425 × altura^0.725
  const duBois = 0.007184 * Math.pow(peso, 0.425) * Math.pow(altura, 0.725);

  // Haycock (1978) — preferida en pediatría:
  //   BSA = 0.024265 × peso^0.5378 × altura^0.3964
  const haycock = 0.024265 * Math.pow(peso, 0.5378) * Math.pow(altura, 0.3964);

  const promedio = (mosteller + duBois + haycock) / 3;

  return {
    mosteller: Number(mosteller.toFixed(3)),
    duBois: Number(duBois.toFixed(3)),
    haycock: Number(haycock.toFixed(3)),
    promedio: Number(promedio.toFixed(3)),
    resumen: `Tu superficie corporal (Mosteller) es ${mosteller.toFixed(2)} m². Promedio de las 3 fórmulas: ${promedio.toFixed(2)} m².`,
    ejemplos: `Aplicaciones: dosis quimioterapia (mg/m²), índice cardíaco (L/min/m²), aclaramiento renal por superficie.`,
  };
}

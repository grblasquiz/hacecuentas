/** Superficie corporal (BSA) — Du Bois, Mosteller, Haycock */
export interface Inputs {
  peso: number;
  altura: number;
  __lang?: string;
}
export interface Outputs {
  mosteller: number;
  duBois: number;
  haycock: number;
  promedio: number;
  resumen: string;
  ejemplos: string;
  _insight?: any;
}

export function superficieCorporal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const peso = Number(i.peso);
  const altura = Number(i.altura);
  if (!peso || peso < 1 || peso > 400) throw new Error(__lang === 'en' ? 'Weight between 1 and 400 kg' : 'Peso entre 1 y 400 kg');
  if (!altura || altura < 30 || altura > 250) throw new Error(__lang === 'en' ? 'Height between 30 and 250 cm' : 'Altura entre 30 y 250 cm');

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

  // Dispersión entre las 3 fórmulas (qué tan de acuerdo están)
  const spread = Math.max(mosteller, duBois, haycock) - Math.min(mosteller, duBois, haycock);
  const insight = {
    title: __lang === 'en' ? 'Body surface area' : 'Superficie corporal',
    text: __lang === 'en'
      ? `Your BSA is **${promedio.toFixed(2)} m²** (average of the 3 formulas). They agree within **${spread.toFixed(2)} m²**, so any of them is reliable for dosing. The Mosteller method (**${mosteller.toFixed(2)} m²**) is the most used in clinical practice.`
      : `Tu superficie corporal es de **${promedio.toFixed(2)} m²** (promedio de las 3 fórmulas). Coinciden dentro de **${spread.toFixed(2)} m²**, así que cualquiera sirve para calcular dosis. El método Mosteller (**${mosteller.toFixed(2)} m²**) es el más usado en la práctica clínica.`,
    tone: 'neutral',
    icon: '🧍',
  };

  return {
    mosteller: Number(mosteller.toFixed(3)),
    duBois: Number(duBois.toFixed(3)),
    haycock: Number(haycock.toFixed(3)),
    promedio: Number(promedio.toFixed(3)),
    resumen: __lang === 'en'
      ? `Your body surface area (Mosteller) is ${mosteller.toFixed(2)} m². Average of the 3 formulas: ${promedio.toFixed(2)} m².`
      : `Tu superficie corporal (Mosteller) es ${mosteller.toFixed(2)} m². Promedio de las 3 fórmulas: ${promedio.toFixed(2)} m².`,
    ejemplos: __lang === 'en'
      ? `Applications: chemotherapy dosing (mg/m²), cardiac index (L/min/m²), renal clearance by body surface.`
      : `Aplicaciones: dosis quimioterapia (mg/m²), índice cardíaco (L/min/m²), aclaramiento renal por superficie.`,
    _insight: insight,
  };
}

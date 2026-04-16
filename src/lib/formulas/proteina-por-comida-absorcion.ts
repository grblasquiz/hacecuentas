/** Calculadora de proteína por comida — absorción óptima */
export interface Inputs {
  peso: number;
  proteinaDiaria: number;
  comidas: number;
}
export interface Outputs {
  proteinaPorComida: number;
  optimo: string;
  horasEntre: number;
  aprovechamiento: string;
  mensaje: string;
}

export function proteinaPorComidaAbsorcion(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const proteinaDiaria = Number(i.proteinaDiaria);
  const comidas = Number(i.comidas) || 4;
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  if (!proteinaDiaria || proteinaDiaria <= 0) throw new Error('Ingresá la proteína diaria');

  const proteinaPorComida = Math.round(proteinaDiaria / comidas);
  const optimoMin = Math.round(peso * 0.4);
  const optimoMax = Math.round(peso * 0.55);
  const horasEntre = Math.round((16 / comidas) * 10) / 10; // horas activas

  let aprovechamiento: string;
  if (proteinaPorComida >= optimoMin && proteinaPorComida <= optimoMax) {
    aprovechamiento = '✅ Distribución óptima: cada comida está en el rango ideal para síntesis muscular.';
  } else if (proteinaPorComida < optimoMin) {
    aprovechamiento = '⚠️ Poca proteína por comida. Considerá reducir el número de comidas o aumentar la proteína total.';
  } else {
    aprovechamiento = '⚠️ Exceso por comida. Podrías distribuir mejor sumando 1-2 comidas más.';
  }

  return {
    proteinaPorComida,
    optimo: `${optimoMin}-\${optimoMax} g por comida`,
    horasEntre,
    aprovechamiento,
    mensaje: `${proteinaPorComida}g por comida en \${comidas} comidas. Rango óptimo: \${optimoMin}-\${optimoMax}g. Separá cada comida ~\${horasEntre}h.`
  };
}
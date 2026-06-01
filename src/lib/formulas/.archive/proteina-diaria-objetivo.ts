/**
 * Proteína diaria por objetivo.
 */

export interface ProteinaDiariaObjetivoInputs {
  peso: number;
  objetivo: string;
}

export interface ProteinaDiariaObjetivoOutputs {
  proteinaGramos: number;
  porComida: number;
  equivalenteAlimentos: string;
  resumen: string;
}

export function proteinaDiariaObjetivo(inputs: ProteinaDiariaObjetivoInputs): ProteinaDiariaObjetivoOutputs {
  const peso = Number(inputs.peso);
  if (!peso || peso <= 0) throw new Error('Ingresá peso válido');
  const ratios: Record<string, number> = {
    'sedentario': 0.8, 'mantenimiento': 1.2, 'perdida': 1.6,
    'hipertrofia': 2.0, 'definicion': 2.5, 'mayor': 1.3,
  };
  const r = ratios[inputs.objetivo] ?? 1.2;
  const total = peso * r;
  const porComida = total / 4;
  return {
    proteinaGramos: Number(total.toFixed(0)),
    porComida: Number(porComida.toFixed(0)),
    equivalenteAlimentos: '200g pollo (44g) + 3 huevos (18g) + 200g yogur (20g) + 1 scoop whey (25g) = ~107g',
    resumen: `Necesitás ${total.toFixed(0)}g proteína/día (${r} g/kg × ${peso}kg), ${porComida.toFixed(0)}g por comida en 4 tomas.`,
  };
}

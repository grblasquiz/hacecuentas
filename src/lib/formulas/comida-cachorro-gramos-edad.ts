/** Gramos de alimento diario para cachorro según edad y peso */
export interface Inputs {
  pesoActual: number;
  edadMeses: number;
  tamanoAdulto?: string;
}
export interface Outputs {
  gramosDia: number;
  kcalDia: number;
  tomas: number;
  gramosPorToma: number;
  transicionAdulto: string;
  detalle: string;
}

const FACTOR_TAMANO: Record<string, number> = {
  mini: 1.0,
  chico: 1.0,
  mediano: 1.0,
  grande: 0.85,
  gigante: 0.75,
};

const TRANSICION: Record<string, string> = {
  mini: 'A los 10-12 meses podés empezar la transición a alimento adulto (gradual en 7-10 días).',
  chico: 'A los 10-12 meses podés empezar la transición a alimento adulto (gradual en 7-10 días).',
  mediano: 'A los 12 meses podés empezar la transición a alimento adulto (gradual en 7-10 días).',
  grande: 'A los 12-15 meses podés empezar la transición a alimento adulto large breed (gradual en 10-14 días).',
  gigante: 'A los 18-24 meses podés empezar la transición a alimento adulto giant breed (gradual en 14 días).',
};

export function comidaCachorroGramosEdad(i: Inputs): Outputs {
  const peso = Number(i.pesoActual);
  const edad = Number(i.edadMeses);
  const tamano = String(i.tamanoAdulto || 'mediano');

  if (!peso || peso <= 0 || peso > 50) throw new Error('Ingresá el peso del cachorro (0,5-50 kg)');
  if (!edad || edad < 1 || edad > 18) throw new Error('Ingresá la edad en meses (1-18)');

  // RER = 70 × peso^0.75
  const RER = 70 * Math.pow(peso, 0.75);

  // Factor por edad
  let factorEdad = 3.0;
  if (edad >= 12) factorEdad = 1.8;
  else if (edad >= 8) factorEdad = 2.0;
  else if (edad >= 4) factorEdad = 2.5;

  // Ajuste por tamaño de raza
  const ajusteTamano = FACTOR_TAMANO[tamano] || 1.0;
  const kcalDia = RER * factorEdad * ajusteTamano;

  // Densidad balanceado puppy super premium: ~3.8 kcal/g
  const gramosDia = Math.round(kcalDia / 3.8);

  // Tomas según edad
  let tomas = 4;
  if (edad >= 12) tomas = 2;
  else if (edad >= 6) tomas = 2;
  else if (edad >= 4) tomas = 3;

  const gramosPorToma = Math.round(gramosDia / tomas);
  const transicionAdulto = TRANSICION[tamano] || TRANSICION.mediano;

  return {
    gramosDia,
    kcalDia: Math.round(kcalDia),
    tomas,
    gramosPorToma,
    transicionAdulto,
    detalle: `Tu cachorro de ${peso} kg (${edad} meses, raza ${tamano}) necesita ~${gramosDia} g de balanceado puppy por día en ${tomas} tomas de ~${gramosPorToma} g. ${transicionAdulto}`,
  };
}

/** Grasa corporal — fórmula US Navy (perímetros) */
export interface Inputs {
  sexo: 'm' | 'f' | string;
  altura: number; // cm
  cuello: number; // cm
  cintura: number; // cm
  cadera?: number; // cm (solo mujeres)
}
export interface Outputs {
  porcentajeGrasa: number;
  categoria: string;
  masaMagra: number;
  masaGrasa: number;
}

export function grasaCorporal(i: Inputs): Outputs {
  const sexo = String(i.sexo || 'm');
  const alt = Number(i.altura);
  const cuello = Number(i.cuello);
  const cintura = Number(i.cintura);
  const cadera = Number(i.cadera) || 0;
  if (!alt || alt <= 0) throw new Error('Ingresá altura');
  if (!cuello || cuello <= 0) throw new Error('Ingresá cuello');
  if (!cintura || cintura <= 0) throw new Error('Ingresá cintura');
  if (sexo === 'f' && !cadera) throw new Error('Ingresá cadera');
  if (sexo !== 'f' && cintura <= cuello) throw new Error('La cintura debe ser mayor al cuello');
  if (sexo === 'f' && (cintura + cadera) <= cuello) throw new Error('La suma de cintura + cadera debe ser mayor al cuello');

  // US Navy formula
  let pct = 0;
  if (sexo === 'f') {
    pct = 495 / (1.29579 - 0.35004 * Math.log10(cintura + cadera - cuello) + 0.22100 * Math.log10(alt)) - 450;
  } else {
    pct = 495 / (1.0324 - 0.19077 * Math.log10(cintura - cuello) + 0.15456 * Math.log10(alt)) - 450;
  }
  pct = Math.max(0, pct);

  // Categorías (American Council on Exercise)
  let categoria = '';
  if (sexo === 'f') {
    if (pct < 14) categoria = 'Grasa esencial (muy bajo)';
    else if (pct < 21) categoria = 'Atlética';
    else if (pct < 25) categoria = 'Fitness';
    else if (pct < 32) categoria = 'Promedio';
    else categoria = 'Obesidad';
  } else {
    if (pct < 6) categoria = 'Grasa esencial (muy bajo)';
    else if (pct < 14) categoria = 'Atlética';
    else if (pct < 18) categoria = 'Fitness';
    else if (pct < 25) categoria = 'Promedio';
    else categoria = 'Obesidad';
  }

  return {
    porcentajeGrasa: Number(pct.toFixed(1)),
    categoria,
    masaGrasa: 0, // se setea luego si hay peso
    masaMagra: 0,
  };
}

/** Calorías diarias recomendadas para un perro */
export interface Inputs {
  pesoPerro: number;
  edad?: string;
  actividad?: string;
  esterilizado?: string;
}
export interface Outputs {
  caloriasDiarias: number;
  gramosBalanceado: number;
  detalle: string;
}

export function caloriasPerro(i: Inputs): Outputs {
  const peso = Number(i.pesoPerro);
  const edad = String(i.edad || 'adulto');
  const actividad = String(i.actividad || 'normal');
  const esterilizado = String(i.esterilizado || 'no');

  if (!peso || peso <= 0) throw new Error('Ingresá el peso del perro');

  // RER (Resting Energy Requirement) = 70 × peso^0.75
  const rer = 70 * Math.pow(peso, 0.75);

  // Factor de mantenimiento
  let factor = 1.6; // adulto entero normal

  if (edad === 'cachorro') {
    factor = peso < 10 ? 3.0 : 2.0; // <4 meses o 4-12 meses aprox
  } else if (edad === 'senior') {
    factor = esterilizado === 'si' ? 1.2 : 1.3;
  } else {
    // Adulto
    if (esterilizado === 'si') {
      if (actividad === 'baja') factor = 1.2;
      else if (actividad === 'normal') factor = 1.4;
      else factor = 1.6;
    } else {
      if (actividad === 'baja') factor = 1.4;
      else if (actividad === 'normal') factor = 1.6;
      else factor = 2.0;
    }
  }

  const calorias = Math.round(rer * factor);

  // Gramos de balanceado premium (~350 kcal/100g)
  const gramos = Math.round(calorias / 3.5);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    caloriasDiarias: calorias,
    gramosBalanceado: gramos,
    detalle: `Perro de ${fmt.format(peso)} kg (${edad}, ${esterilizado === 'si' ? 'esterilizado' : 'entero'}, actividad ${actividad}): ~${fmt.format(calorias)} kcal/día. Equivale a ~${fmt.format(gramos)} g de balanceado premium (350 kcal/100g). Factor usado: ${factor.toFixed(1)}.`,
  };
}

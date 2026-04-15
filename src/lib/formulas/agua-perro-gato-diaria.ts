/** Ml de agua diaria recomendada según peso y especie */
export interface Inputs {
  especie?: string; // perro | gato
  pesoKg: number;
  actividad?: string; // baja | media | alta
  tipoAlimento?: string; // seco | humedo | mixto
  climaCalido?: boolean;
  lactante?: boolean;
}
export interface Outputs {
  aguaMinMl: number;
  aguaMaxMl: number;
  aguaPromedioMl: number;
  aguaEnLitros: number;
  aguaPorComida: number; // cuánta aporta la comida húmeda
  recomendacion: string;
  especie: string;
  resumen: string;
}

export function aguaPerroGatoDiaria(i: Inputs): Outputs {
  const especie = String(i.especie || 'perro');
  const peso = Number(i.pesoKg);
  const act = String(i.actividad || 'media');
  const alim = String(i.tipoAlimento || 'seco');
  const calor = i.climaCalido === true;
  const lact = i.lactante === true;

  if (!peso || peso <= 0) throw new Error('Ingresá el peso en kg');

  // Base según especie
  // Perro: 50-60 ml/kg/día (base)
  // Gato: 50-60 ml/kg/día (base) — más crítico por tendencia a no tomar
  let base = 0;
  if (especie === 'perro') base = 55;
  else if (especie === 'gato') base = 55;
  else throw new Error('Especie no válida');

  let aguaMin = peso * 40;
  let aguaMax = peso * 70;

  // Ajuste por actividad
  if (act === 'alta') { aguaMin *= 1.3; aguaMax *= 1.4; }
  else if (act === 'baja') { aguaMin *= 0.9; aguaMax *= 1.0; }

  // Ajuste por clima
  if (calor) { aguaMin *= 1.2; aguaMax *= 1.5; }

  // Ajuste por lactancia
  if (lact) { aguaMin *= 1.5; aguaMax *= 2.0; }

  // Aporte de alimento húmedo (75% agua) vs seco (10% agua)
  // Estimación: un perro/gato come ~2% de su peso en materia seca
  let aguaComida = 0;
  if (alim === 'humedo') aguaComida = peso * 2 * 10 * 0.75; // g/kg × 10 para gramos × % agua
  else if (alim === 'mixto') aguaComida = peso * 2 * 10 * 0.4;
  else aguaComida = peso * 2 * 10 * 0.10;

  const promedio = (aguaMin + aguaMax) / 2;

  let recomendacion = '';
  if (especie === 'gato') {
    recomendacion = 'Los gatos suelen tomar poca agua. Colocá bebedero lejos del plato de comida, mantené el agua fresca y considerá una fuente de agua circulante.';
  } else {
    if (peso < 10) recomendacion = 'Usá bebedero de 500 ml mínimo, renová 2 veces al día.';
    else if (peso < 25) recomendacion = 'Bebedero de 1-1.5 L mínimo, siempre con agua fresca disponible.';
    else recomendacion = 'Bebedero de 2+ L o dos bebederos en distintos lugares de la casa. Ojo en verano.';
  }

  return {
    aguaMinMl: Math.round(aguaMin),
    aguaMaxMl: Math.round(aguaMax),
    aguaPromedioMl: Math.round(promedio),
    aguaEnLitros: Number((promedio / 1000).toFixed(2)),
    aguaPorComida: Math.round(aguaComida),
    recomendacion,
    especie: especie === 'perro' ? 'Perro' : 'Gato',
    resumen: `Tu ${especie} de ${peso} kg necesita ~${Math.round(promedio)} ml de agua/día (rango ${Math.round(aguaMin)}-${Math.round(aguaMax)} ml).`,
  };
}

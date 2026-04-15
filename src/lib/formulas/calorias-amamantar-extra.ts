/** Calorías extra que necesita una mujer lactante */
export interface Inputs {
  caloriasBase: number;
  mesesPostparto: number;
  exclusiva?: boolean;
  objetivoPeso?: string; // 'mantener' | 'perder'
}
export interface Outputs {
  caloriasExtra: number;
  caloriasTotales: number;
  proteinaExtra: number;
  liquidosExtraLitros: number;
  recomendacion: string;
  resumen: string;
}

export function caloriasAmamantarExtra(i: Inputs): Outputs {
  const base = Number(i.caloriasBase);
  const meses = Number(i.mesesPostparto);
  const exclusiva = i.exclusiva !== false;
  const obj = String(i.objetivoPeso || 'mantener');

  if (!base || base < 1000 || base > 4000) throw new Error('Ingresá calorías base válidas (1000-4000 kcal)');
  if (meses < 0 || meses > 24) throw new Error('Los meses postparto deben estar entre 0 y 24');

  let extra = 0;
  // OMS/IOM: primeros 6 meses lactancia exclusiva = +500 kcal; 7-12 meses = +400 kcal; más de 12 meses = +300 kcal
  if (meses < 6) extra = 500;
  else if (meses < 12) extra = 400;
  else extra = 330;

  if (!exclusiva) extra = extra * 0.6;

  // Si la mamá busca bajar peso postparto, se resta ~170 kcal (movilización de reservas)
  if (obj === 'perder') extra = extra - 170;

  const caloriasTotales = base + extra;

  // Proteína extra: +25 g/día (OMS)
  const proteinaExtra = 25;

  // Líquidos extra: 700-900 mL/día (el agua va a la leche)
  const liquidosExtra = 0.8;

  let recomendacion = '';
  if (exclusiva && meses < 6) {
    recomendacion = 'Priorizá alimentos nutritivos: proteínas magras, lácteos, verduras, frutas, grasas saludables. Hidratate generosamente.';
  } else if (meses < 12) {
    recomendacion = 'Con lactancia + alimentación complementaria, ajustá según hambre y peso.';
  } else {
    recomendacion = 'Lactancia prolongada aporta menos calorías extra. Ajustá a tus señales de hambre.';
  }

  return {
    caloriasExtra: Math.round(extra),
    caloriasTotales: Math.round(caloriasTotales),
    proteinaExtra,
    liquidosExtraLitros: liquidosExtra,
    recomendacion,
    resumen: `Necesitás ~${Math.round(extra)} kcal extra por día (total ${Math.round(caloriasTotales)} kcal) y +${proteinaExtra} g de proteína. Tomá ${liquidosExtra} L extra de líquidos.`,
  };
}

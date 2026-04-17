/**
 * Calculadora de regla 500 para astrofotografía de estrellas
 */

export interface Inputs {
  focal: number; sensor: number;
}

export interface Outputs {
  regla500: string; regla300: string; consejo: string;
}

export function regla500AstrofotografiaEstrellas(inputs: Inputs): Outputs {
  const f = Number(inputs.focal);
  const s = Math.round(Number(inputs.sensor));
  if (!f || !s) throw new Error('Completá los campos');
  const crop: Record<number, number> = { 1: 1.0, 2: 1.5, 3: 1.6, 4: 2.0 };
  const c = crop[s] || 1.0;
  const focalEq = f * c;
  const r500 = 500 / focalEq;
  const r300 = 300 / focalEq;
  let tip = '';
  if (r500 < 5) tip = 'Tiempo muy corto: considerá tracker astronómico o stack.';
  else if (r500 < 15) tip = 'Tiempo moderado: subí ISO a 3200-6400 y abrí a f/2.8 o menos.';
  else tip = 'Tiempo amplio: ISO 1600-3200 con f/2.8-4 debería bastar.';
  return {
    regla500: `${r500.toFixed(1)} s`,
    regla300: `${r300.toFixed(1)} s (estrellas puntuales en zoom 100%)`,
    consejo: tip,
  };
}

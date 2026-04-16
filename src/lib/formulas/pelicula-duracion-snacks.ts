/** Calculadora de Snacks para Película */
export interface Inputs { duracionMin: number; personas: number; intensidad: string; }
export interface Outputs { pochoclosLitros: number; bebidasLitros: number; snacksExtra: string; presupuesto: number; }

export function peliculaDuracionSnacks(i: Inputs): Outputs {
  const dur = Number(i.duracionMin);
  const pers = Number(i.personas);
  if (!dur || dur <= 0) throw new Error('Ingresá la duración');
  if (!pers || pers < 1) throw new Error('Ingresá las personas');

  const mult: Record<string, number> = { light: 0.7, normal: 1.0, heavy: 1.5 };
  const m = mult[i.intensidad] || 1;

  // Base: 2L pochoclos per person per 2 hours
  const pochoclosLitros = Number((pers * (dur / 120) * 2 * m).toFixed(1));
  // Base: 0.5L bebida per person per 2 hours
  const bebidasLitros = Number((pers * (dur / 120) * 0.5 * m).toFixed(1));

  const snacks: string[] = [];
  if (pers >= 3) snacks.push(`${Math.ceil(pers / 2)} paquetes de papas/nachos`);
  if (dur > 150) snacks.push('snacks extra para la segunda mitad');
  if (i.intensidad === 'heavy') snacks.push('pizza o empanadas para complementar');
  snacks.push(`${pers} chocolates o alfajores individuales`);

  const presupuesto = Math.round((pochoclosLitros * 500 + bebidasLitros * 800 + pers * 1000) * m);

  return { pochoclosLitros, bebidasLitros, snacksExtra: snacks.join('. '), presupuesto };
}

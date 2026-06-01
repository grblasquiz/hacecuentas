/** Calculadora de Snacks para Película */
export interface Inputs { duracionMin: number; personas: number; intensidad: string; __lang?: string; }
export interface Outputs { pochoclosLitros: number; bebidasLitros: number; snacksExtra: string; presupuesto: number; }

export function peliculaDuracionSnacks(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errDuracion: 'Ingresá la duración',
      errPersonas: 'Ingresá las personas',
      snackExtra: 'snacks extra para la segunda mitad',
      snackHeavy: 'pizza o empanadas para complementar',
    },
    en: {
      errDuracion: 'Enter the duration',
      errPersonas: 'Enter the number of people',
      snackExtra: 'extra snacks for the second half',
      snackHeavy: 'pizza or finger food to complement',
    },
  } as const)[__lang];

  const dur = Number(i.duracionMin);
  const pers = Number(i.personas);
  if (!dur || dur <= 0) throw new Error(T.errDuracion);
  if (!pers || pers < 1) throw new Error(T.errPersonas);

  const mult: Record<string, number> = { light: 0.7, normal: 1.0, heavy: 1.5 };
  const m = mult[i.intensidad] || 1;

  // Base: 2L pochoclos per person per 2 hours
  const pochoclosLitros = Number((pers * (dur / 120) * 2 * m).toFixed(1));
  // Base: 0.5L bebida per person per 2 hours
  const bebidasLitros = Number((pers * (dur / 120) * 0.5 * m).toFixed(1));

  const snacks: string[] = [];
  if (pers >= 3) snacks.push(__lang === 'en' ? `${Math.ceil(pers / 2)} bags of chips/nachos` : `${Math.ceil(pers / 2)} paquetes de papas/nachos`);
  if (dur > 150) snacks.push(T.snackExtra);
  if (i.intensidad === 'heavy') snacks.push(T.snackHeavy);
  snacks.push(__lang === 'en' ? `${pers} individual chocolates or candy bars` : `${pers} chocolates o alfajores individuales`);

  const presupuesto = Math.round((pochoclosLitros * 500 + bebidasLitros * 800 + pers * 1000) * m);

  return { pochoclosLitros, bebidasLitros, snacksExtra: snacks.join('. '), presupuesto };
}

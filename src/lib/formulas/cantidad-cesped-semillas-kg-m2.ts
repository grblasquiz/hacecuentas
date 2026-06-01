export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function cantidadCespedSemillasKgM2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const m = Number(i.m2) || 0;
  const rate: Record<string, number> = { rye: 40, fescue: 30, mezcla: 35 };
  const g = m * (rate[String(i.tipo)] || 35);
  const resumen = __lang === 'en'
    ? `${(g/1000).toFixed(1)} kg of ${i.tipo} seed for ${m} m².`
    : `${(g/1000).toFixed(1)} kg de semilla ${i.tipo} para ${m} m².`;
  return { gramos: (g/1000).toFixed(2) + ' kg', resumen };
}

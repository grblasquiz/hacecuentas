/** Calculadora del Péndulo Simple — T = 2π√(L/g) */
export interface Inputs { longitud: number; gravedad: number; }
export interface Outputs { periodo: number; frecuencia: number; frecuenciaAngular: number; formula: string; }

export function penduloSimplePeriodo(i: Inputs): Outputs {
  const L = Number(i.longitud);
  const g = Number(i.gravedad) || 9.81;
  if (!L || L <= 0) throw new Error('La longitud debe ser mayor a 0');
  if (g <= 0) throw new Error('La gravedad debe ser mayor a 0');

  const T = 2 * Math.PI * Math.sqrt(L / g);
  const f = 1 / T;
  const omega = 2 * Math.PI * f;

  return {
    periodo: Number(T.toFixed(4)),
    frecuencia: Number(f.toFixed(4)),
    frecuenciaAngular: Number(omega.toFixed(4)),
    formula: `T = 2π√(${L}/${g}) = 2π × ${Math.sqrt(L / g).toFixed(4)} = ${T.toFixed(4)} s`,
  };
}

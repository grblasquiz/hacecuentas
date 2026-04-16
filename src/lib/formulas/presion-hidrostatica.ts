/** Calculadora de Presión Hidrostática — P = ρgh */
export interface Inputs { densidad: number; profundidad: number; gravedad: number; }
export interface Outputs { presionPa: number; presionAtm: number; presionBar: number; presionTotal: number; }

export function presionHidrostatica(i: Inputs): Outputs {
  const rho = Number(i.densidad);
  const h = Number(i.profundidad);
  const g = Number(i.gravedad) || 9.81;
  if (rho <= 0) throw new Error('La densidad debe ser mayor a 0');
  if (h < 0) throw new Error('La profundidad no puede ser negativa');

  const P = rho * g * h;
  const Patm = P / 101325;
  const Pbar = P / 100000;
  const Ptotal = P + 101325; // sumando presión atmosférica

  return {
    presionPa: Number(P.toFixed(2)),
    presionAtm: Number(Patm.toFixed(4)),
    presionBar: Number(Pbar.toFixed(4)),
    presionTotal: Number(Ptotal.toFixed(2)),
  };
}

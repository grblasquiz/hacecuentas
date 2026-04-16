/** Calculadora de Rendimiento — %R = (real/teórico) × 100 */
export interface Inputs { masaReal: number; masaTeorica: number; }
export interface Outputs { rendimiento: number; perdida: number; clasificacion: string; formula: string; }

export function rendimientoReaccionQuimica(i: Inputs): Outputs {
  const real = Number(i.masaReal);
  const teorica = Number(i.masaTeorica);
  if (real < 0) throw new Error('La masa real no puede ser negativa');
  if (!teorica || teorica <= 0) throw new Error('La masa teórica debe ser mayor a 0');

  const rend = (real / teorica) * 100;
  const perdida = teorica - real;

  let clasif: string;
  if (rend >= 90) clasif = 'Excelente (≥ 90%)';
  else if (rend >= 70) clasif = 'Bueno (70-90%)';
  else if (rend >= 50) clasif = 'Moderado (50-70%)';
  else clasif = 'Bajo (< 50%)';

  return {
    rendimiento: Number(rend.toFixed(2)),
    perdida: Number(perdida.toFixed(4)),
    clasificacion: clasif,
    formula: `%R = (${real} / ${teorica}) × 100 = ${rend.toFixed(2)}%`,
  };
}

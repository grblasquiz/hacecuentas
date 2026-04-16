/** Calculadora Viaje Interestelar — t = d/v */
export interface Inputs { distanciaLy: number; velocidadKms: number; }
export interface Outputs { tiempoAnos: string; fraccionC: string; distanciaKm: string; comparacion: string; }

export function tiempoViajeInterestelar(i: Inputs): Outputs {
  const dLy = Number(i.distanciaLy);
  const vKms = Number(i.velocidadKms);
  if (dLy <= 0) throw new Error('La distancia debe ser mayor a 0');
  if (vKms <= 0) throw new Error('La velocidad debe ser mayor a 0');

  const c = 299792.458; // km/s
  const lyKm = 9.461e12; // km per light year
  const dKm = dLy * lyKm;
  const tSec = dKm / vKms;
  const tYears = tSec / (365.25 * 86400);
  const frac = vKms / c;

  let tiempoStr: string;
  if (tYears < 1) tiempoStr = `${(tYears * 365.25).toFixed(1)} días`;
  else if (tYears < 1000) tiempoStr = `${tYears.toFixed(1)} años`;
  else if (tYears < 1e6) tiempoStr = `${(tYears / 1000).toFixed(1)} mil años`;
  else tiempoStr = `${(tYears / 1e6).toFixed(1)} millones de años`;

  let comp: string;
  if (tYears < 100) comp = 'Podría ser viable en una vida humana';
  else if (tYears < 1000) comp = 'Requeriría nave generacional';
  else if (tYears < 100000) comp = 'Más largo que la historia de la civilización';
  else comp = 'Más largo que la existencia del Homo sapiens (~300.000 años)';

  return {
    tiempoAnos: tiempoStr,
    fraccionC: `${(frac * 100).toFixed(6)}% de c (${frac.toFixed(8)} c)`,
    distanciaKm: `${dKm.toExponential(4)} km`,
    comparacion: comp,
  };
}

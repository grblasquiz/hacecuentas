/** Calculadora Vida del Sol — vida ∝ M^(-2.5) */
export interface Inputs { masaEstelar: number; edadActual: number; }
export interface Outputs { resultado: string; vidaTotal: number; vidaRestante: number; porcentaje: number; }

export function edadSolVidaRestante(i: Inputs): Outputs {
  const M = Number(i.masaEstelar);
  const edad = Number(i.edadActual);
  if (M < 0.08 || M > 150) throw new Error('La masa debe estar entre 0,08 y 150 masas solares');
  if (edad < 0) throw new Error('La edad no puede ser negativa');

  // Vida en secuencia principal aproximada: T ≈ 10000 × M^(-2.5) millones de años
  // (para el Sol: M=1 → T ≈ 10000 M años)
  const vidaTotal = 10000 * Math.pow(M, -2.5);
  const restante = Math.max(0, vidaTotal - edad);
  const pct = Math.min(100, (edad / vidaTotal) * 100);

  let estado: string;
  if (pct < 10) estado = 'Estrella joven (inicio de secuencia principal)';
  else if (pct < 50) estado = 'Estrella en primera mitad de vida';
  else if (pct < 90) estado = 'Estrella en segunda mitad de vida';
  else if (pct < 100) estado = 'Estrella al final de la secuencia principal';
  else estado = 'Estrella post-secuencia principal (gigante/supergigante)';

  return {
    resultado: `${estado}. Vida total: ${vidaTotal.toFixed(0)} M años. Restante: ${restante.toFixed(0)} M años (${(100 - pct).toFixed(1)}%).`,
    vidaTotal: Number(vidaTotal.toFixed(0)),
    vidaRestante: Number(restante.toFixed(0)),
    porcentaje: Number(pct.toFixed(2)),
  };
}

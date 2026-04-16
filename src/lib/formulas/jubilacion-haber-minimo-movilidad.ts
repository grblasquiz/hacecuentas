/** Haber jubilatorio con fórmula de movilidad Argentina
 *  Ley 27.609 (2020): movilidad trimestral por RIPTE + IPC
 *  Actualización: fórmula vigente 2024-2026
 */

export interface Inputs {
  haberActual: number;
  variacionRipte: number;
  variacionIpc: number;
  trimestresProyeccion: number;
  aniosAporte: number;
}

export interface Outputs {
  haberProyectado: number;
  aumentoTotal: number;
  aumentoPorcentaje: number;
  movilidadTrimestral: number;
  haberMinimo: number;
  formula: string;
  explicacion: string;
}

export function jubilacionHaberMinimoMovilidad(i: Inputs): Outputs {
  const haber = Number(i.haberActual);
  const ripte = Number(i.variacionRipte);
  const ipc = Number(i.variacionIpc);
  const trimestres = Math.max(1, Math.round(Number(i.trimestresProyeccion) || 4));

  if (!haber || haber <= 0) throw new Error('Ingresá tu haber jubilatorio actual');
  if (ripte === undefined) throw new Error('Ingresá la variación RIPTE trimestral');
  if (ipc === undefined) throw new Error('Ingresá la variación IPC trimestral');

  // Fórmula de movilidad: combinación RIPTE (50%) + IPC (50%)
  // Desde DNU 274/2024: movilidad mensual por IPC del mes anterior
  // Usamos la fórmula simplificada para proyección
  const movilidadTrimestral = (ripte + ipc) / 2;

  let haberProyectado = haber;
  for (let t = 0; t < trimestres; t++) {
    haberProyectado = haberProyectado * (1 + movilidadTrimestral / 100);
  }

  const aumentoTotal = haberProyectado - haber;
  const aumentoPorcentaje = ((haberProyectado / haber) - 1) * 100;

  // Haber mínimo estimado (abril 2026)
  const haberMinimo = 340_000;

  const formula = `Haber proyectado = $${haber.toLocaleString()} × (1 + ${movilidadTrimestral.toFixed(2)}%)^${trimestres} = $${Math.round(haberProyectado).toLocaleString()}`;
  const explicacion = `Haber actual: $${haber.toLocaleString()}. Movilidad trimestral estimada: ${movilidadTrimestral.toFixed(2)}% (RIPTE ${ripte}% + IPC ${ipc}% promediados). En ${trimestres} trimestre(s): haber proyectado $${Math.round(haberProyectado).toLocaleString()} (+${aumentoPorcentaje.toFixed(1)}%, +$${Math.round(aumentoTotal).toLocaleString()}). Haber mínimo garantizado (ref. abril 2026): ~$${haberMinimo.toLocaleString()}. Nota: desde marzo 2024 la movilidad se actualiza mensualmente por IPC del mes anterior (DNU 274/2024).`;

  return {
    haberProyectado: Math.round(haberProyectado),
    aumentoTotal: Math.round(aumentoTotal),
    aumentoPorcentaje: Number(aumentoPorcentaje.toFixed(2)),
    movilidadTrimestral: Number(movilidadTrimestral.toFixed(2)),
    haberMinimo,
    formula,
    explicacion,
  };
}

/** Resistencia equivalente en serie y paralelo */
export interface Inputs { r1: number; r2: number; r3: number; r4: number; }
export interface Outputs { serie: number; paralelo: number; cantidadResistencias: number; detalle: string; }

export function resistenciaParaleloSerie(i: Inputs): Outputs {
  const valores = [Number(i.r1), Number(i.r2), Number(i.r3), Number(i.r4)].filter(v => v > 0);

  if (valores.length < 2) throw new Error('Ingresá al menos dos resistencias mayores a 0');

  const serie = valores.reduce((sum, v) => sum + v, 0);
  const invParalelo = valores.reduce((sum, v) => sum + 1 / v, 0);
  const paralelo = 1 / invParalelo;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const valoresTexto = valores.map(v => `${fmt.format(v)} Ω`).join(' + ');

  return {
    serie: Number(serie.toFixed(2)),
    paralelo: Number(paralelo.toFixed(2)),
    cantidadResistencias: valores.length,
    detalle: `${valores.length} resistencias (${valoresTexto}). Serie: ${fmt.format(serie)} Ω. Paralelo: ${fmt.format(paralelo)} Ω.`,
  };
}

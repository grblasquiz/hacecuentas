/** Calculadora de Proyección de Crecimiento de Seguidores */
export interface Inputs { seguidoresActuales: number; crecimientoMensual: number; mesesProyectar: number; }
export interface Outputs { seguidoresFinales: number; crecimientoTotal: number; seguidoresGanados: number; mensaje: string; }

export function crecimientoSeguidoresProyeccion(i: Inputs): Outputs {
  const seg = Number(i.seguidoresActuales);
  const pct = Number(i.crecimientoMensual) / 100;
  const meses = Number(i.mesesProyectar);
  if (!seg || seg <= 0) throw new Error('Ingresá los seguidores actuales');
  if (isNaN(pct)) throw new Error('Ingresá el crecimiento mensual');
  if (!meses || meses < 1) throw new Error('Ingresá los meses a proyectar');

  const seguidoresFinales = Math.round(seg * Math.pow(1 + pct, meses));
  const seguidoresGanados = seguidoresFinales - seg;
  const crecimientoTotal = ((seguidoresFinales - seg) / seg) * 100;

  return {
    seguidoresFinales,
    crecimientoTotal: Number(crecimientoTotal.toFixed(1)),
    seguidoresGanados,
    mensaje: `De ${seg.toLocaleString()} a ${seguidoresFinales.toLocaleString()} seguidores en ${meses} meses (+${seguidoresGanados.toLocaleString()}, +${crecimientoTotal.toFixed(1)}%).`,
  };
}

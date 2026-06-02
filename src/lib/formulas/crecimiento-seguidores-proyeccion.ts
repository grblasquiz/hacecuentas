/** Calculadora de Proyección de Crecimiento de Seguidores */
export interface Inputs { seguidoresActuales: number; crecimientoMensual: number; mesesProyectar: number; }
export interface Outputs { seguidoresFinales: number; crecimientoTotal: number; seguidoresGanados: number; mensaje: string; _insight?: any; _chart?: any; }

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

  const crecRedondeado = Number(crecimientoTotal.toFixed(1));
  const _insight = {
    title: 'Tu proyección de crecimiento',
    text: pct <= 0
      ? `Con un crecimiento mensual de **${(pct * 100).toFixed(1)}%**, en **${meses} meses** tu cuenta pasaría de ${seg.toLocaleString()} a **${seguidoresFinales.toLocaleString()}** seguidores. Revisá tu estrategia de contenido para revertir el estancamiento.`
      : `Manteniendo **${(pct * 100).toFixed(1)}%** mensual, en **${meses} meses** sumás **${seguidoresGanados.toLocaleString()}** seguidores (**+${crecRedondeado}%**) gracias al efecto compuesto. La constancia es lo que multiplica el resultado.`,
    tone: pct <= 0 ? 'warn' : 'good',
    icon: '📈',
  };
  const _chart = seguidoresGanados > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Seguidores actuales', value: seg },
      { label: 'Nuevos seguidores', value: seguidoresGanados },
    ],
    prefix: '',
    centerValue: seguidoresFinales.toLocaleString(),
    centerLabel: 'Total proyectado',
    ariaLabel: `De ${seg.toLocaleString()} seguidores actuales sumás ${seguidoresGanados.toLocaleString()} nuevos para llegar a ${seguidoresFinales.toLocaleString()} en ${meses} meses`,
  } : undefined;
  const out: Outputs = {
    seguidoresFinales,
    crecimientoTotal: crecRedondeado,
    seguidoresGanados,
    mensaje: `De ${seg.toLocaleString()} a ${seguidoresFinales.toLocaleString()} seguidores en ${meses} meses (+${seguidoresGanados.toLocaleString()}, +${crecimientoTotal.toFixed(1)}%).`,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}

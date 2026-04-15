/** RPM (Revenue Per Mille) — valor por cada 1.000 páginas vistas */

export interface Inputs {
  ingresosTotales: number;
  paginasVistas: number;
  sesiones: number;
}

export interface Outputs {
  rpmPageview: number;
  rpmSesion: number;
  ingresoPorPagina: number;
  detalle: string;
}

export function valorPaginaVistaRpm(i: Inputs): Outputs {
  const ingresos = Number(i.ingresosTotales);
  const pageviews = Number(i.paginasVistas);
  const sesiones = Number(i.sesiones);

  if (isNaN(ingresos) || ingresos < 0) throw new Error('Ingresá los ingresos totales');
  if (isNaN(pageviews) || pageviews <= 0) throw new Error('Ingresá las páginas vistas');
  if (isNaN(sesiones) || sesiones <= 0) throw new Error('Ingresá las sesiones');

  const rpmPageview = (ingresos / pageviews) * 1000;
  const rpmSesion = (ingresos / sesiones) * 1000;
  const ingresoPorPagina = ingresos / pageviews;
  const pagesPorSesion = pageviews / sesiones;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const fmtDec = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  const detalle =
    `Ingresos: $${fmt.format(ingresos)} con ${fmt.format(pageviews)} pageviews (${fmt.format(sesiones)} sesiones). ` +
    `RPM pageview: $${fmtDec.format(rpmPageview)} cada 1.000 vistas. ` +
    `RPM sesión: $${fmtDec.format(rpmSesion)} cada 1.000 sesiones. ` +
    `Ingreso por pageview: $${fmtDec.format(ingresoPorPagina)}. ` +
    `Páginas/sesión: ${pagesPorSesion.toFixed(2)}.`;

  return {
    rpmPageview: Number(rpmPageview.toFixed(2)),
    rpmSesion: Number(rpmSesion.toFixed(2)),
    ingresoPorPagina: Number(ingresoPorPagina.toFixed(2)),
    detalle,
  };
}

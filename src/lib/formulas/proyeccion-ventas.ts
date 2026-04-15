/** Proyección de ventas con tasa de crecimiento */

export interface Inputs {
  ventasActuales: number;
  crecimientoMensual: number;
  mesesProyectar: number;
}

export interface Outputs {
  ventasProyectadas: number;
  crecimientoTotal: number;
  ventasMesAMes: string;
  detalle: string;
}

export function proyeccionVentas(i: Inputs): Outputs {
  const ventas = Number(i.ventasActuales);
  const crecimiento = Number(i.crecimientoMensual);
  const meses = Number(i.mesesProyectar);

  if (isNaN(ventas) || ventas <= 0) throw new Error('Ingresá las ventas mensuales actuales');
  if (isNaN(crecimiento)) throw new Error('Ingresá la tasa de crecimiento mensual');
  if (isNaN(meses) || meses < 1 || meses > 60) throw new Error('El plazo debe ser entre 1 y 60 meses');

  const tasa = crecimiento / 100;
  const ventasProyectadas = ventas * Math.pow(1 + tasa, meses);
  const crecimientoTotal = ((ventasProyectadas / ventas) - 1) * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Generar desglose mes a mes (máximo primeros 12 o todos si son menos)
  const maxMes = Math.min(meses, 12);
  const mesAMes: string[] = [];
  let acumulado = 0;
  for (let m = 1; m <= meses; m++) {
    const ventasMes = ventas * Math.pow(1 + tasa, m);
    acumulado += ventasMes;
    if (m <= maxMes || m === meses) {
      mesAMes.push(`Mes ${m}: $${fmt.format(ventasMes)}`);
    }
  }

  const ventasMesAMes = mesAMes.join(' | ');

  const detalle =
    `Partiendo de $${fmt.format(ventas)}/mes con ${crecimiento}% de crecimiento mensual, ` +
    `en ${meses} meses llegarías a $${fmt.format(ventasProyectadas)}/mes ` +
    `(crecimiento total: ${crecimientoTotal.toFixed(1)}%). ` +
    `Facturación acumulada estimada: $${fmt.format(acumulado)}.`;

  return {
    ventasProyectadas: Math.round(ventasProyectadas),
    crecimientoTotal: Number(crecimientoTotal.toFixed(1)),
    ventasMesAMes,
    detalle,
  };
}

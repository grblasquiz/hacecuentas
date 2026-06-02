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
  _insight?: any;
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

  const tono = crecimiento > 0 ? 'good' : crecimiento < 0 ? 'warn' : 'neutral';
  const multiplo = ventasProyectadas / ventas;
  const textoInsight = crecimiento > 0
    ? `Con **${crecimiento}% mensual**, en ${meses} meses tu facturación pasa de $${fmt.format(ventas)} a **$${fmt.format(Math.round(ventasProyectadas))}/mes** (×${multiplo.toFixed(1)}). El interés compuesto del crecimiento acumula **$${fmt.format(Math.round(acumulado))}** de facturación total en el período.`
    : crecimiento < 0
    ? `Con una caída de **${Math.abs(crecimiento)}% mensual**, en ${meses} meses la facturación baja de $${fmt.format(ventas)} a **$${fmt.format(Math.round(ventasProyectadas))}/mes** (${crecimientoTotal.toFixed(1)}%). Revisá el funnel: a este ritmo perdés casi la mitad cada ${Math.ceil(70 / Math.abs(crecimiento))} meses.`
    : `Sin crecimiento (**0% mensual**), la facturación se mantiene en **$${fmt.format(ventas)}/mes** durante los ${meses} meses. Acumularías $${fmt.format(Math.round(acumulado))} sin ganar terreno.`;

  return {
    ventasProyectadas: Math.round(ventasProyectadas),
    crecimientoTotal: Number(crecimientoTotal.toFixed(1)),
    ventasMesAMes,
    detalle,
    _insight: {
      title: 'Tu proyección de ventas',
      text: textoInsight,
      tone: tono,
      icon: '📈',
    },
  };
}

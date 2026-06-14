/**
 * Calculadora del costo de mantener una propiedad vacía
 * Suma los gastos fijos (expensas, impuestos, mantenimiento, seguro) prorrateados a mensual
 * y el costo de oportunidad del alquiler no percibido.
 */

export interface CostoMantenerPropiedadVaciaMensualInputs {
  expensas_mensuales: number | string;
  impuestos_anuales: number | string;
  mantenimiento_anual: number | string;
  seguro_anual?: number | string; // opcional
  meses_vacia?: number | string; // default 1
  alquiler_perdido_mensual?: number | string; // opcional → costo de oportunidad
}

export interface CostoMantenerPropiedadVaciaMensualOutputs {
  costoMensualTenencia: number;
  costoTotalGastos: number;
  alquilerPerdidoTotal: number;
  costoOportunidadTotal: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function num(v: number | string | undefined, def = 0): number {
  if (v === '' || v == null) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function costoMantenerPropiedadVaciaMensual(
  i: CostoMantenerPropiedadVaciaMensualInputs
): CostoMantenerPropiedadVaciaMensualOutputs {
  const expensas = Math.max(0, num(i.expensas_mensuales));
  const impuestosAnuales = Math.max(0, num(i.impuestos_anuales));
  const mantenimientoAnual = Math.max(0, num(i.mantenimiento_anual));
  const seguroAnual = Math.max(0, num(i.seguro_anual, 0));
  let meses = Math.round(num(i.meses_vacia, 1));
  const alquilerPerdidoMensual = Math.max(0, num(i.alquiler_perdido_mensual, 0));

  if (meses <= 0) meses = 1;
  if (meses > 600) meses = 600;

  // Costo mensual de tenencia (gastos prorrateados, sin contar el alquiler no percibido)
  const costoMensualTenencia =
    expensas + impuestosAnuales / 12 + mantenimientoAnual / 12 + seguroAnual / 12;

  if (costoMensualTenencia <= 0 && alquilerPerdidoMensual <= 0)
    throw new Error('Ingresá al menos un gasto o el alquiler perdido para calcular');

  const costoTotalGastos = costoMensualTenencia * meses;
  const alquilerPerdidoTotal = alquilerPerdidoMensual * meses;
  const costoOportunidadTotal = costoTotalGastos + alquilerPerdidoTotal;

  // Componentes mensuales para el desglose / doughnut
  const componentes = [
    { nombre: 'Expensas', valor: expensas },
    { nombre: 'Impuestos', valor: impuestosAnuales / 12 },
    { nombre: 'Mantenimiento', valor: mantenimientoAnual / 12 },
    { nombre: 'Seguro', valor: seguroAnual / 12 },
    { nombre: 'Alquiler perdido', valor: alquilerPerdidoMensual },
  ].filter((x) => x.valor > 0);

  const totalMensualConOportunidad = costoMensualTenencia + alquilerPerdidoMensual;
  const top = componentes.slice().sort((a, b) => b.valor - a.valor)[0];
  const topPct =
    top && totalMensualConOportunidad > 0
      ? Math.round((top.valor / totalMensualConOportunidad) * 100)
      : 0;

  const tone: 'good' | 'warn' | 'neutral' = 'warn';

  const insightText =
    alquilerPerdidoMensual > 0
      ? `Tener este inmueble vacío cuesta **$${Math.round(totalMensualConOportunidad).toLocaleString('es-AR')}/mes** sumando gastos fijos ($${Math.round(costoMensualTenencia).toLocaleString('es-AR')}) y el alquiler que dejás de cobrar ($${Math.round(alquilerPerdidoMensual).toLocaleString('es-AR')}). En **${meses} ${meses === 1 ? 'mes' : 'meses'}** el costo de oportunidad total trepa a **$${Math.round(costoOportunidadTotal).toLocaleString('es-AR')}**. Cada mes vacío es plata que no vuelve.`
      : `Mantener el inmueble vacío cuesta **$${Math.round(costoMensualTenencia).toLocaleString('es-AR')}/mes** de gastos fijos; en **${meses} ${meses === 1 ? 'mes' : 'meses'}** son **$${Math.round(costoTotalGastos).toLocaleString('es-AR')}**. Cargá el alquiler que podrías cobrar para ver el costo de oportunidad real (el rubro más pesado hoy es ${top ? top.nombre.toLowerCase() : 'las expensas'}, ${topPct}% del total mensual).`;

  const _insight = {
    title: 'Costo de tenerla vacía',
    text: insightText,
    tone,
    icon: '🏚️',
  };

  const _chart =
    componentes.length > 0
      ? {
          type: 'doughnut',
          slices: componentes.map((x) => ({ label: x.nombre, value: Math.round(x.valor) })),
          prefix: '$',
          centerValue: `$${Math.round(totalMensualConOportunidad).toLocaleString('es-AR')}`,
          centerLabel: 'Costo mensual',
          ariaLabel: `Gráfico de torta de los componentes mensuales del costo de tener la propiedad vacía, total $${Math.round(totalMensualConOportunidad).toLocaleString('es-AR')} por mes`,
        }
      : undefined;

  const out: CostoMantenerPropiedadVaciaMensualOutputs = {
    costoMensualTenencia: Math.round(costoMensualTenencia),
    costoTotalGastos: Math.round(costoTotalGastos),
    alquilerPerdidoTotal: Math.round(alquilerPerdidoTotal),
    costoOportunidadTotal: Math.round(costoOportunidadTotal),
    detalle: `Costo mensual de tenencia: $${Math.round(costoMensualTenencia).toLocaleString('es-AR')}. En ${meses} ${meses === 1 ? 'mes' : 'meses'}: gastos $${Math.round(costoTotalGastos).toLocaleString('es-AR')} + alquiler perdido $${Math.round(alquilerPerdidoTotal).toLocaleString('es-AR')} = costo de oportunidad total $${Math.round(costoOportunidadTotal).toLocaleString('es-AR')}.`,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}

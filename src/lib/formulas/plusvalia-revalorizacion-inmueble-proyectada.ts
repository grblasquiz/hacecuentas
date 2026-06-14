/**
 * Calculadora de plusvalía / revalorización proyectada de un inmueble
 * Proyecta el valor futuro con interés compuesto:
 *   valor_proyectado = valor_actual × (1 + tasa)^años
 */

export interface PlusvaliaRevalorizacionInmuebleProyectadaInputs {
  valor_actual: number | string;
  revalorizacion_anual_pct?: number | string; // % default 5
  anos?: number | string; // default 10
}

export interface PlusvaliaRevalorizacionInmuebleProyectadaOutputs {
  valorProyectado: number;
  gananciaCapital: number;
  porcentajeTotal: number;
  tablaAnios: { anio: number; valor: number; ganancia: number }[];
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function num(v: number | string | undefined, def = 0): number {
  if (v === '' || v == null) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function plusvaliaRevalorizacionInmuebleProyectada(
  i: PlusvaliaRevalorizacionInmuebleProyectadaInputs
): PlusvaliaRevalorizacionInmuebleProyectadaOutputs {
  const valorActual = num(i.valor_actual);
  const tasaPct = num(i.revalorizacion_anual_pct, 5);
  let anos = Math.round(num(i.anos, 10));

  if (!valorActual || valorActual <= 0) throw new Error('Ingresá el valor actual de la propiedad');
  if (anos <= 0) anos = 1;
  if (anos > 100) anos = 100;

  const tasa = tasaPct / 100;

  const tablaAnios: { anio: number; valor: number; ganancia: number }[] = [];
  for (let a = 1; a <= anos; a++) {
    const valor = valorActual * Math.pow(1 + tasa, a);
    tablaAnios.push({
      anio: a,
      valor: Math.round(valor),
      ganancia: Math.round(valor - valorActual),
    });
  }

  const valorProyectado = valorActual * Math.pow(1 + tasa, anos);
  const gananciaCapital = valorProyectado - valorActual;
  const porcentajeTotal = (gananciaCapital / valorActual) * 100;

  const pctR = Math.round(porcentajeTotal * 10) / 10;

  const tone: 'good' | 'warn' | 'neutral' =
    tasaPct < 0 ? 'warn' : tasaPct >= 5 ? 'good' : 'neutral';

  const insightText =
    tasaPct >= 0
      ? `A una revalorización del **${tasaPct}% anual**, en **${anos} años** la propiedad pasaría de $${Math.round(valorActual).toLocaleString('es-AR')} a **$${Math.round(valorProyectado).toLocaleString('es-AR')}**: una ganancia de capital de **$${Math.round(gananciaCapital).toLocaleString('es-AR')}** (+${pctR}%). El interés compuesto hace que la suba se acelere con los años.`
      : `Con una variación del **${tasaPct}% anual** (negativa), en **${anos} años** el valor caería a **$${Math.round(valorProyectado).toLocaleString('es-AR')}** (${pctR}%). Es un escenario de desvalorización: revisá la tasa supuesta.`;

  const _insight = {
    title: 'Plusvalía proyectada',
    text: insightText,
    tone,
    icon: '📈',
  };

  // Bar chart: valor por año (incluye el año 0)
  const labels = ['Hoy', ...tablaAnios.map((t) => `Año ${t.anio}`)];
  const values = [Math.round(valorActual), ...tablaAnios.map((t) => t.valor)];

  const _chart = {
    type: 'bar',
    labels,
    values,
    prefix: '$',
    ariaLabel: `Proyección del valor del inmueble: de $${Math.round(valorActual).toLocaleString('es-AR')} hoy a $${Math.round(valorProyectado).toLocaleString('es-AR')} en ${anos} años.`,
  };

  return {
    valorProyectado: Math.round(valorProyectado),
    gananciaCapital: Math.round(gananciaCapital),
    porcentajeTotal: pctR,
    tablaAnios,
    detalle: `En ${anos} años a ${tasaPct}% anual: valor proyectado $${Math.round(valorProyectado).toLocaleString('es-AR')}, ganancia de capital $${Math.round(gananciaCapital).toLocaleString('es-AR')} (${pctR}% total).`,
    _insight,
    _chart,
  };
}

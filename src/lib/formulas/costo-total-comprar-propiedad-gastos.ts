/**
 * Calculadora del costo total de comprar una propiedad (gastos de compra)
 * Suma comisión inmobiliaria, sellos (impuesto de sellos), honorarios de escribano y otros gastos.
 * Todos los porcentajes son parametrizables porque varían por jurisdicción.
 */

export interface CostoTotalComprarPropiedadGastosInputs {
  precio: number | string;
  comision_pct?: number | string; // % default 4
  sellos_pct?: number | string; // % default 1.75 (mitad del 3.5% que suele pagar el comprador)
  honorarios_escribano_pct?: number | string; // % default 1.5
  otros_gastos?: number | string; // $ opcional (informes, gestoría, etc.)
}

export interface CostoTotalComprarPropiedadGastosOutputs {
  comision: number;
  sellos: number;
  honorariosEscribano: number;
  otrosGastos: number;
  costoGastosTotal: number;
  precioFinalTotal: number;
  porcentajeGastos: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

function num(v: number | string | undefined, def = 0): number {
  if (v === '' || v == null) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export function costoTotalComprarPropiedadGastos(
  i: CostoTotalComprarPropiedadGastosInputs
): CostoTotalComprarPropiedadGastosOutputs {
  const precio = num(i.precio);
  const comisionPct = Math.max(0, num(i.comision_pct, 4));
  const sellosPct = Math.max(0, num(i.sellos_pct, 1.75));
  const escribanoPct = Math.max(0, num(i.honorarios_escribano_pct, 1.5));
  const otros = Math.max(0, num(i.otros_gastos, 0));

  if (!precio || precio <= 0) throw new Error('Ingresá el precio de la propiedad');

  const comision = precio * (comisionPct / 100);
  const sellos = precio * (sellosPct / 100);
  const honorariosEscribano = precio * (escribanoPct / 100);

  const costoGastosTotal = comision + sellos + honorariosEscribano + otros;
  const precioFinalTotal = precio + costoGastosTotal;
  const porcentajeGastos = (costoGastosTotal / precio) * 100;

  const pctR = Math.round(porcentajeGastos * 100) / 100;

  const items = [
    { nombre: 'Comisión inmobiliaria', valor: comision },
    { nombre: 'Impuesto de sellos', valor: sellos },
    { nombre: 'Honorarios escribano', valor: honorariosEscribano },
    { nombre: 'Otros gastos', valor: otros },
  ].filter((x) => x.valor > 0);

  const top = items.slice().sort((a, b) => b.valor - a.valor)[0];
  const topPct = top ? Math.round((top.valor / costoGastosTotal) * 100) : 0;

  const tone: 'good' | 'warn' | 'neutral' = pctR >= 9 ? 'warn' : 'neutral';

  const _insight = {
    title: 'Cuánto cuesta de verdad la compra',
    text: `Además del precio publicado vas a pagar **$${Math.round(costoGastosTotal).toLocaleString('es-AR')}** en gastos (**${pctR}%** sobre el precio), así que la operación cierra en **$${Math.round(precioFinalTotal).toLocaleString('es-AR')}**. El rubro más pesado es **${top ? top.nombre.toLowerCase() : 'la comisión'}**, que se lleva el ${topPct}% de los gastos. Los porcentajes de sellos y comisión varían por jurisdicción: ajustalos a tu provincia.`,
    tone,
    icon: '🧾',
  };

  const _chart =
    items.length > 0
      ? {
          type: 'doughnut',
          slices: items.map((x) => ({ label: x.nombre, value: Math.round(x.valor) })),
          prefix: '$',
          centerValue: `${pctR}%`,
          centerLabel: 'Gastos s/precio',
          ariaLabel: `Gráfico de torta del desglose de gastos de compra, total $${Math.round(costoGastosTotal).toLocaleString('es-AR')}`,
        }
      : undefined;

  const out: CostoTotalComprarPropiedadGastosOutputs = {
    comision: Math.round(comision),
    sellos: Math.round(sellos),
    honorariosEscribano: Math.round(honorariosEscribano),
    otrosGastos: Math.round(otros),
    costoGastosTotal: Math.round(costoGastosTotal),
    precioFinalTotal: Math.round(precioFinalTotal),
    porcentajeGastos: pctR,
    detalle: `Gastos de compra: $${Math.round(costoGastosTotal).toLocaleString('es-AR')} (${pctR}% del precio). Comisión $${Math.round(comision).toLocaleString('es-AR')}, sellos $${Math.round(sellos).toLocaleString('es-AR')}, escribano $${Math.round(honorariosEscribano).toLocaleString('es-AR')}, otros $${Math.round(otros).toLocaleString('es-AR')}. Total a desembolsar: $${Math.round(precioFinalTotal).toLocaleString('es-AR')}.`,
    _insight,
  };
  if (_chart) out._chart = _chart;
  return out;
}

/** Qué sueldo necesitás para comprar un auto financiado con prendario.
 * Regla estándar de finanzas personales: la cuota del auto no debería superar
 * el 20% del ingreso neto (y el costo total de tenencia, el 35%).
 * Cuota por sistema francés sobre el monto financiado → sueldo mínimo = cuota / (pct/100).
 * Rule-based: la TNA la ingresa el usuario, acá no hay datos de gobierno. */

export interface Inputs {
  precioAuto: number;
  anticipoPct: number;
  plazoMeses: number;
  tna: number;
  pctSueldo?: number;
}

export interface Outputs {
  sueldoMinimo: number;
  cuotaMensual: number;
  montoFinanciar: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function queSueldoNecesitoParaComprarUnAuto(i: Inputs): Outputs {
  const precio = Number(i.precioAuto);
  const anticipoPct = Number(i.anticipoPct);
  const plazo = Number(i.plazoMeses);
  const tna = Number(i.tna);
  const pct = Number(i.pctSueldo) || 20;

  if (isNaN(precio) || precio <= 0) throw new Error('Ingresá el precio del auto');
  if (isNaN(anticipoPct) || anticipoPct < 0 || anticipoPct >= 100) throw new Error('El anticipo debe estar entre 0% y 99%');
  if (isNaN(plazo) || plazo <= 0 || plazo > 120) throw new Error('El plazo debe estar entre 1 y 120 meses');
  if (isNaN(tna) || tna < 0 || tna > 500) throw new Error('Ingresá una TNA entre 0% y 500%');
  if (isNaN(pct) || pct <= 0 || pct > 100) throw new Error('El porcentaje del sueldo debe estar entre 1 y 100');

  const anticipo = precio * (anticipoPct / 100);
  const montoFinanciar = precio - anticipo;

  // Cuota por sistema francés: C = P × r / (1 − (1+r)^−n), con r = tasa mensual.
  const r = tna / 100 / 12;
  const cuotaMensual = r === 0
    ? montoFinanciar / plazo
    : (montoFinanciar * r) / (1 - Math.pow(1 + r, -plazo));

  const sueldoMinimo = cuotaMensual / (pct / 100);
  const restoSueldo = sueldoMinimo - cuotaMensual;
  const totalPagar = cuotaMensual * plazo;
  const interesesTotales = totalPagar - montoFinanciar;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Auto de $${fmt.format(precio)} con ${anticipoPct}% de anticipo ($${fmt.format(anticipo)}): financiás $${fmt.format(montoFinanciar)} ` +
    `a ${plazo} meses con TNA ${tna}% → cuota de $${fmt.format(cuotaMensual)} (sistema francés). ` +
    `Para que esa cuota no supere el ${pct}% de tu ingreso, necesitás ganar al menos $${fmt.format(sueldoMinimo)} netos por mes. ` +
    `Total a pagar por el crédito: $${fmt.format(totalPagar)} ($${fmt.format(interesesTotales)} de intereses).`;

  const tone = pct > 20 ? 'warn' : 'good';
  const insight = {
    title: 'El sueldo que banca esa cuota',
    text: `Con una cuota de **$${fmt.format(cuotaMensual)}**, necesitás ganar **$${fmt.format(sueldoMinimo)}** netos para que el auto se lleve el **${pct}%** de tu ingreso. ` +
      (pct > 20
        ? `Estás por encima del 20% recomendado: acordate de que patente, seguro y nafta suman por fuera de la cuota — el costo total de tenencia no debería pasar el 35% del sueldo.`
        : `Estás dentro de la regla del 20% para la cuota. Ojo: sumale seguro, patente y nafta — el costo total de tenencia no debería superar el 35% de tu ingreso.`),
    tone,
    icon: '🚗',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cuota del auto', value: Math.round(cuotaMensual) },
      { label: 'Resto del sueldo', value: Math.round(restoSueldo) },
    ],
    prefix: '$',
    centerValue: '$' + fmt.format(Math.round(sueldoMinimo)),
    centerLabel: 'Sueldo necesario',
    ariaLabel: 'Composición del sueldo necesario: parte que se va en la cuota del auto y parte que queda libre.',
  };

  return {
    sueldoMinimo: Math.round(sueldoMinimo),
    cuotaMensual: Math.round(cuotaMensual),
    montoFinanciar: Math.round(montoFinanciar),
    detalle,
    _insight: insight,
    _chart: chart,
  };
}

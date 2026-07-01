/** Qué sueldo necesitás demostrar para sacar un crédito personal.
 * Los bancos aplican la relación cuota-ingreso (RCI): la cuota no puede superar
 * un porcentaje del sueldo neto demostrable (típicamente 25%-35%).
 * Cuota por sistema francés → sueldo mínimo = cuota / (RCI/100).
 * Rule-based: la TNA la ingresa el usuario. */

export interface Inputs {
  montoPrestamo: number;
  plazoMeses: number;
  tna: number;
  rciMaxima?: number;
}

export interface Outputs {
  sueldoMinimo: number;
  cuotaMensual: number;
  totalDevolver: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function queSueldoNecesitoParaSacarUnCredito(i: Inputs): Outputs {
  const monto = Number(i.montoPrestamo);
  const plazo = Number(i.plazoMeses);
  const tna = Number(i.tna);
  const rci = Number(i.rciMaxima) || 30;

  if (isNaN(monto) || monto <= 0) throw new Error('Ingresá el monto del préstamo');
  if (isNaN(plazo) || plazo <= 0 || plazo > 240) throw new Error('El plazo debe estar entre 1 y 240 meses');
  if (isNaN(tna) || tna < 0 || tna > 500) throw new Error('Ingresá una TNA entre 0% y 500%');
  if (isNaN(rci) || rci <= 0 || rci > 100) throw new Error('La RCI debe estar entre 1 y 100');

  // Cuota por sistema francés: C = P × r / (1 − (1+r)^−n), con r = tasa mensual.
  const r = tna / 100 / 12;
  const cuotaMensual = r === 0
    ? monto / plazo
    : (monto * r) / (1 - Math.pow(1 + r, -plazo));

  const sueldoMinimo = cuotaMensual / (rci / 100);
  const totalDevolver = cuotaMensual * plazo;
  const interesesTotales = totalDevolver - monto;
  const restoSueldo = sueldoMinimo - cuotaMensual;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Préstamo de $${fmt.format(monto)} a ${plazo} meses con TNA ${tna}% → cuota de $${fmt.format(cuotaMensual)} (sistema francés). ` +
    `Con una RCI máxima del ${rci}%, tenés que demostrar un ingreso neto de al menos $${fmt.format(sueldoMinimo)} por mes. ` +
    `Devolvés en total $${fmt.format(totalDevolver)} ($${fmt.format(interesesTotales)} de intereses).`;

  const insight = {
    title: 'El ingreso que te pide el banco',
    text: `Para una cuota de **$${fmt.format(cuotaMensual)}** con RCI del **${rci}%**, el banco quiere ver ingresos por **$${fmt.format(sueldoMinimo)}** netos demostrables. ` +
      (rci > 30
        ? `Una RCI mayor al 30% te aprueba con menos sueldo, pero te deja el presupuesto más apretado cada mes.`
        : `Si no llegás con tu recibo, muchos bancos aceptan sumar el ingreso de tu cónyuge o co-titular.`),
    tone: rci > 30 ? 'warn' : 'neutral',
    icon: '🏦',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cuota del préstamo', value: Math.round(cuotaMensual) },
      { label: 'Resto del sueldo', value: Math.round(restoSueldo) },
    ],
    prefix: '$',
    centerValue: '$' + fmt.format(Math.round(sueldoMinimo)),
    centerLabel: 'Sueldo necesario',
    ariaLabel: 'Composición del sueldo mínimo: parte comprometida en la cuota del préstamo y parte libre.',
  };

  return {
    sueldoMinimo: Math.round(sueldoMinimo),
    cuotaMensual: Math.round(cuotaMensual),
    totalDevolver: Math.round(totalDevolver),
    detalle,
    _insight: insight,
    _chart: chart,
  };
}

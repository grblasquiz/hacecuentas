/** Costo real de pagar en cuotas vs contado */

export interface Inputs {
  precioContado: number;
  cantidadCuotas: number;
  montoCuota: number;
}

export interface Outputs {
  costoTotal: number;
  interesTotal: number;
  porcentajeRecargo: number;
  tasaMensual: number;
  _chart?: any;
  _insight?: any;
}

/**
 * Calcula la tasa mensual implícita con Newton-Raphson.
 * Precio contado = cuota × [(1 - (1+r)^(-n)) / r]
 */
function calcularTasaImplicita(precioContado: number, cuota: number, n: number): number {
  if (precioContado >= cuota * n) return 0; // no hay recargo

  let r = 0.02; // estimación inicial: 2% mensual
  for (let iter = 0; iter < 100; iter++) {
    const factor = Math.pow(1 + r, -n);
    const f = cuota * ((1 - factor) / r) - precioContado;
    const df = cuota * ((-n * Math.pow(1 + r, -n - 1) * r - (1 - factor)) / (r * r));
    const rNew = r - f / df;
    if (Math.abs(rNew - r) < 1e-10) return rNew;
    r = rNew;
    if (r <= 0) r = 0.001;
  }
  return r;
}

export function costoRealCuotas(i: Inputs): Outputs {
  const precioContado = Number(i.precioContado);
  const cantidadCuotas = Number(i.cantidadCuotas);
  const montoCuota = Number(i.montoCuota);

  if (isNaN(precioContado) || precioContado <= 0) throw new Error('Ingresá el precio de contado');
  if (isNaN(cantidadCuotas) || cantidadCuotas < 1) throw new Error('Ingresá la cantidad de cuotas');
  if (isNaN(montoCuota) || montoCuota <= 0) throw new Error('Ingresá el monto de cada cuota');

  const costoTotal = cantidadCuotas * montoCuota;
  const interesTotal = costoTotal - precioContado;
  const porcentajeRecargo = (interesTotal / precioContado) * 100;

  let tasaMensual = 0;
  if (interesTotal > 0) {
    tasaMensual = calcularTasaImplicita(precioContado, montoCuota, cantidadCuotas) * 100;
  }

  const chart = interesTotal > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Precio contado', value: Math.round(precioContado) },
      { label: 'Intereses', value: Math.round(interesTotal) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoTotal).toLocaleString('es-AR'),
    centerLabel: 'Total en cuotas',
    ariaLabel: 'Composición del costo en cuotas: precio de contado más intereses',
  } : undefined;

  const recargoFmt = Number(porcentajeRecargo.toFixed(2));
  const tasaFmt = Number(tasaMensual.toFixed(2));
  const interesFmt = Math.round(interesTotal).toLocaleString('es-AR');

  let insight;
  if (Math.round(interesTotal) <= 0) {
    insight = {
      title: 'Cuotas sin interés: conviene financiar',
      text: `Pagás lo mismo en **${cantidadCuotas} cuotas** que de contado (**0% de recargo**). Comprar financiado y dejar la plata rindiendo es la jugada: con cualquier inflación o plazo fijo, las cuotas te salen más baratas en términos reales.`,
      tone: 'good' as const,
      icon: '✅',
    };
  } else {
    const alto = recargoFmt >= 30;
    insight = {
      title: alto ? 'Recargo alto en cuotas' : 'Lo que cuesta financiar',
      text: `Pagar en cuotas suma **$${interesFmt}** de interés, un **${recargoFmt}%** sobre el precio de contado, que equivale a una tasa implícita del **${tasaFmt}% mensual**. ${alto ? 'Compará contra un plazo fijo: a esta tasa probablemente convenga pagar de contado.' : 'Si tu plazo fijo rinde más que esa tasa, financiar todavía te conviene.'}`,
      tone: alto ? ('warn' as const) : ('neutral' as const),
      icon: '💳',
    };
  }

  return {
    costoTotal: Math.round(costoTotal),
    interesTotal: Math.round(interesTotal),
    porcentajeRecargo: recargoFmt,
    tasaMensual: tasaFmt,
    _chart: chart,
    _insight: insight,
  };
}

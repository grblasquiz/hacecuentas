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

  return {
    costoTotal: Math.round(costoTotal),
    interesTotal: Math.round(interesTotal),
    porcentajeRecargo: Number(porcentajeRecargo.toFixed(2)),
    tasaMensual: Number(tasaMensual.toFixed(2)),
  };
}

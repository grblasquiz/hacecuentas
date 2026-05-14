/** Hot Sale Argentina (mayo): cuotas sin interés vs contado con descuento, ajustado por inflación */
export interface Inputs {
  precioContado: number;
  cuotas: number;
  inflacionAnualPct: number;
  descuentoContadoPct: number;
}
export interface Outputs {
  valorPresenteCuotas: number;
  valorContadoConDescuento: number;
  diferencia: number;
  recomendacion: string;
  ahorroPctRealEnCuotas: number;
}

export function hotSaleCuotasSinInteresVsContado(i: Inputs): Outputs {
  const precio = Number(i.precioContado);
  const cuotas = Number(i.cuotas) || 1;
  const inflacion = Number(i.inflacionAnualPct);
  const desc = Number(i.descuentoContadoPct) || 0;
  if (!precio || precio <= 0) throw new Error('Ingresá un precio de lista válido');
  if (isNaN(inflacion) || inflacion < 0) throw new Error('Ingresá una inflación anual válida');
  if (cuotas < 1) throw new Error('La cantidad de cuotas debe ser al menos 1');

  const inflacionMensual = Math.pow(1 + inflacion / 100, 1 / 12) - 1;
  const cuotaMensual = precio / cuotas;
  let valorPresenteCuotas = 0;
  for (let mes = 1; mes <= cuotas; mes++) {
    valorPresenteCuotas += cuotaMensual / Math.pow(1 + inflacionMensual, mes - 1);
  }
  const valorContadoConDescuento = precio * (1 - desc / 100);
  const diferencia = valorContadoConDescuento - valorPresenteCuotas;
  const ahorroPctRealEnCuotas = ((precio - valorPresenteCuotas) / precio) * 100;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  let recomendacion: string;
  if (diferencia > 0) {
    recomendacion = `Cuotas Hot Sale conviene: ahorrás $${fmt(diferencia)} en valor presente (${ahorroPctRealEnCuotas.toFixed(1)}% real por inflación). Con inflación argentina alta, cuotas sin interés casi siempre ganan a descuentos contado bajos.`;
  } else if (diferencia === 0) {
    recomendacion = 'Las dos opciones son equivalentes en valor presente. Decidí según tu flujo de caja.';
  } else {
    recomendacion = `Contado con ${desc}% Hot Sale conviene: ahorrás $${fmt(-diferencia)} sobre el valor presente de las cuotas. Pagá al toque si tenés la plata disponible.`;
  }
  return {
    valorPresenteCuotas: Math.round(valorPresenteCuotas),
    valorContadoConDescuento: Math.round(valorContadoConDescuento),
    diferencia: Math.round(diferencia),
    recomendacion,
    ahorroPctRealEnCuotas: Number(ahorroPctRealEnCuotas.toFixed(2)),
  };
}

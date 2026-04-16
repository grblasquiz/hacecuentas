/** Cuotas sin interés vs contado — ¿qué conviene? */
export interface Inputs {
  precioLista: number;
  cantidadCuotas: number;
  descuentoContado: number;
  inflacionMensual: number;
}
export interface Outputs {
  costoRealCuotas: number;
  precioContado: number;
  ahorroReal: number;
  recomendacion: string;
  valorCuota: number;
}

export function cuotasSinInteresPrecio(i: Inputs): Outputs {
  const precio = Number(i.precioLista);
  const cuotas = Number(i.cantidadCuotas);
  const descContado = Number(i.descuentoContado);
  const inflMensual = Number(i.inflacionMensual);

  if (!precio || precio <= 0) throw new Error('Ingresá el precio de lista');
  if (!cuotas || cuotas <= 0) throw new Error('Ingresá la cantidad de cuotas');
  if (descContado < 0 || descContado > 100) throw new Error('Descuento inválido');
  if (inflMensual < 0) throw new Error('La inflación no puede ser negativa');

  const valorCuota = precio / cuotas;
  const tasaDesc = inflMensual / 100;

  // Valor presente de las cuotas descontando por inflación
  let costoRealCuotas = 0;
  for (let mes = 1; mes <= cuotas; mes++) {
    costoRealCuotas += valorCuota / Math.pow(1 + tasaDesc, mes);
  }

  const precioContado = precio * (1 - descContado / 100);
  const ahorroReal = Math.abs(precioContado - costoRealCuotas);
  const convieneCuotas = costoRealCuotas < precioContado;

  return {
    costoRealCuotas: Math.round(costoRealCuotas),
    precioContado: Math.round(precioContado),
    ahorroReal: Math.round(ahorroReal),
    recomendacion: convieneCuotas
      ? `Convienen las cuotas sin interés. Ahorrás $${Math.round(ahorroReal).toLocaleString('es-AR')} en términos reales.`
      : `Conviene pagar de contado. Ahorrás $${Math.round(ahorroReal).toLocaleString('es-AR')} respecto a las cuotas.`,
    valorCuota: Math.round(valorCuota),
  };
}
